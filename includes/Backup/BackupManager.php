<?php
/**
 * Backup & restore manager.
 *
 * Creates a safe copy of the original file before it is replaced, allows
 * restore, and cleans up old backups so storage does not grow unbounded.
 *
 * @package OptiPress\Backup
 */

namespace OptiPress\Backup;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Manages original-file backups.
 */
class BackupManager {

	/**
	 * Base backup directory (inside uploads).
	 *
	 * @return string
	 */
	private function base_dir() {
		$upload = wp_upload_dir();
		return $upload['basedir'] . '/optipress-backups';
	}

	/**
	 * Per-attachment backup directory.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return string
	 */
	private function attachment_dir( $attachment_id ) {
		return $this->base_dir() . '/' . (int) $attachment_id;
	}

	/**
	 * Create a backup of the original file.
	 *
	 * @param int    $attachment_id Attachment ID.
	 * @param string $source_path  Absolute source path.
	 * @return string|false Backup path on success.
	 */
	public function backup( $attachment_id, $source_path ) {
		if ( ! file_exists( $source_path ) ) {
			return false;
		}

		$dir = $this->attachment_dir( $attachment_id );
		if ( ! wp_mkdir_p( $dir ) ) {
			return false;
		}

		// Never let a re-optimization overwrite the pristine original: if we
		// already hold a raster-format backup and the current file is a
		// converted WebP/AVIF, the existing backup IS the original — keep it.
		$existing   = $this->latest_backup( $attachment_id );
		$src_ext    = strtolower( pathinfo( $source_path, PATHINFO_EXTENSION ) );
		if ( $existing ) {
			$existing_ext = strtolower( pathinfo( $existing, PATHINFO_EXTENSION ) );
			$is_raster    = in_array( $existing_ext, array( 'jpg', 'jpeg', 'png', 'gif' ), true );
			$is_modern    = in_array( $src_ext, array( 'webp', 'avif' ), true );
			if ( $is_raster && $is_modern ) {
				return $existing;
			}
		}

		$ext  = pathinfo( $source_path, PATHINFO_EXTENSION ) ?: 'img';
		$name = 'original-' . time() . '.' . $ext;
		$dest = $dir . '/' . $name;

		if ( ! @copy( $source_path, $dest ) ) { // phpcs:ignore WordPress.PHP.NoSilencedErrors
			return false;
		}

		$this->cleanup( $attachment_id, $dest );

		return $dest;
	}

	/**
	 * Restore the most recent backup for an attachment.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return bool
	 */
	public function restore( $attachment_id ) {
		$backup = $this->latest_backup( $attachment_id );
		if ( ! $backup ) {
			return false;
		}

		$current = get_attached_file( $attachment_id );
		if ( ! $current ) {
			return false;
		}

		$dir  = dirname( $current );
		$ext  = pathinfo( $backup, PATHINFO_EXTENSION );
		$base = pathinfo( $current, PATHINFO_FILENAME );
		// Restore to the ORIGINAL filename/extension. Otherwise a converted
		// ".webp" file would end up holding JPG content and be served with the
		// wrong content-type (broken image).
		$restored_path = $dir . '/' . $base . '.' . $ext;

		if ( ! @copy( $backup, $restored_path ) ) { // phpcs:ignore WordPress.PHP.NoSilencedErrors
			return false;
		}

		// Remove the previously converted file if it had a different name.
		if ( $restored_path !== $current && file_exists( $current ) ) {
			@unlink( $current ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
		}

		// Remove converted sub-sizes left behind by optimization.
		foreach ( array( 'webp', 'avif' ) as $cext ) {
			foreach ( glob( $dir . '/' . $base . '-*.' . $cext ) ?: array() as $_f ) {
				@unlink( $_f ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
			}
		}

		$relative = str_replace( wp_upload_dir()['basedir'] . '/', '', $restored_path );
		update_post_meta( $attachment_id, '_wp_attached_file', $relative );

		$mime = wp_get_image_mime( $restored_path );
		wp_update_post(
			array(
				'ID'             => $attachment_id,
				'post_mime_type' => $mime,
			)
		);
		delete_post_meta( $attachment_id, '_optipress_optimized' );

		// wp_generate_attachment_metadata() lives in an admin-only include that
		// is NOT loaded on frontend/REST/cron requests — load it ourselves or
		// restored attachments would silently keep stale webp metadata.
		if ( ! function_exists( 'wp_generate_attachment_metadata' ) ) {
			require_once ABSPATH . 'wp-admin/includes/image.php';
		}
		wp_update_attachment_metadata(
			$attachment_id,
			wp_generate_attachment_metadata( $attachment_id, $restored_path )
		);

		optipress_log( 'info', __( 'نسخه اصلی بازیابی شد.', 'optipress' ), array( 'attachment_id' => $attachment_id ) );
		return true;
	}

	/**
	 * Whether an attachment currently has a stored backup.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return bool
	 */
	public function has_backup( $attachment_id ) {
		return null !== $this->latest_backup( $attachment_id );
	}

	/**
	 * Get the latest backup path for an attachment.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return string|null
	 */
	public function latest_backup( $attachment_id ) {
		$dir = $this->attachment_dir( $attachment_id );
		if ( ! is_dir( $dir ) ) {
			return null;
		}
		$files = glob( $dir . '/original-*.*' );
		if ( empty( $files ) ) {
			return null;
		}
		usort( $files, static function ( $a, $b ) {
			return filemtime( $b ) - filemtime( $a );
		} );
		return $files[0];
	}

	/**
	 * Remove redundant backups for an attachment, keeping the newest within
	 * each format family. Backups from a different family (e.g. the pristine
	 * JPG next to an AVIF-generation backup) are never pruned.
	 *
	 * @param int    $attachment_id Attachment ID.
	 * @param string $keep          Path to keep.
	 * @return void
	 */
	private function cleanup( $attachment_id, $keep ) {
		$dir      = $this->attachment_dir( $attachment_id );
		$keep_ext = strtolower( pathinfo( $keep, PATHINFO_EXTENSION ) );
		$raster   = array( 'jpg', 'jpeg', 'png', 'gif' );

		foreach ( glob( $dir . '/original-*.*' ) ?: array() as $file ) {
			if ( $file === $keep ) {
				continue;
			}
			$ext = strtolower( pathinfo( $file, PATHINFO_EXTENSION ) );
			// Only prune within the same format family.
			if ( in_array( $ext, $raster, true ) === in_array( $keep_ext, $raster, true ) ) {
				@unlink( $file ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
			}
		}
	}

	/**
	 * Recursively delete an attachment's entire backup directory.
	 *
	 * Hooked to attachment deletion so deleted media does not leave orphaned
	 * copies (and retained personal data) behind forever.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return void
	 */
	public function delete_backup_dir( $attachment_id ) {
		$dir = $this->attachment_dir( (int) $attachment_id );
		if ( ! is_dir( $dir ) ) {
			return;
		}
		foreach ( glob( $dir . '/*' ) ?: array() as $file ) {
			if ( is_file( $file ) ) {
				@unlink( $file ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
			}
		}
		@rmdir( $dir ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
	}

	/**
	 * Total backup storage used (bytes).
	 *
	 * @return int
	 */
	public function storage_used() {
		$base = $this->base_dir();
		if ( ! is_dir( $base ) ) {
			return 0;
		}
		$total = 0;
		foreach ( glob( $base . '/*', GLOB_ONLYDIR ) ?: array() as $dir ) {
			foreach ( glob( $dir . '/original-*.*' ) ?: array() as $file ) {
				$total += (int) @filesize( $file ); // phpcs:ignore
			}
		}
		return $total;
	}
}
