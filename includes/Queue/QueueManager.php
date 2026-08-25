<?php
/**
 * Queue manager: persistence and state transitions for optimization jobs.
 *
 * Uses a dedicated, indexed table so the system scales to tens of thousands
 * of items without polluting WordPress options.
 *
 * @package OptiPress\Queue
 */

namespace OptiPress\Queue;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Manages queue items and their lifecycle.
 */
class QueueManager {

	/**
	 * Table name (without prefix).
	 *
	 * @var string
	 */
	const TABLE = 'optipress_queue';

	/**
	 * Create the queue table. Safe to call repeatedly.
	 *
	 * @return void
	 */
	public static function install_table() {
		global $wpdb;

		$table   = $wpdb->prefix . self::TABLE;
		$collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE IF NOT EXISTS {$table} (
			id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			attachment_id   BIGINT UNSIGNED NOT NULL,
			source_path     VARCHAR(191)    NOT NULL,
			source_mime     VARCHAR(100)    NOT NULL DEFAULT '',
			source_size     BIGINT UNSIGNED NOT NULL DEFAULT 0,
			source_width    INT UNSIGNED    NOT NULL DEFAULT 0,
			source_height   INT UNSIGNED    NOT NULL DEFAULT 0,
			target_format   VARCHAR(20)     NOT NULL DEFAULT 'original',
			status          VARCHAR(20)     NOT NULL DEFAULT 'pending',
			attempts        TINYINT UNSIGNED NOT NULL DEFAULT 0,
			error_message   TEXT            NULL,
			started_at      DATETIME        NULL,
			completed_at    DATETIME        NULL,
			original_size   BIGINT UNSIGNED NOT NULL DEFAULT 0,
			optimized_size  BIGINT UNSIGNED NOT NULL DEFAULT 0,
			saved_bytes     BIGINT          NOT NULL DEFAULT 0,
			optimization_ratio DECIMAL(5,2) NOT NULL DEFAULT 0,
			created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY attachment_id (attachment_id),
			KEY status (status),
			KEY created_at (created_at),
			UNIQUE KEY uq_attachment (attachment_id, target_format)
		) {$collate};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );
	}

	/**
	 * Resolve the queue table name.
	 *
	 * @return string
	 */
	public static function table() {
		global $wpdb;
		return $wpdb->prefix . self::TABLE;
	}

	/**
	 * Enqueue an attachment if it is not already queued/optimized.
	 *
	 * @param int    $attachment_id Attachment ID.
	 * @param string $path          Absolute source path.
	 * @param string $target_format Desired format (original|webp|avif).
	 * @return int Inserted row ID, or 0 if a duplicate already exists.
	 */
	public function enqueue( $attachment_id, $path, $target_format = 'original' ) {
		global $wpdb;

		$mime = wp_get_image_mime( $path );
		$size = (int) @filesize( $path ); // phpcs:ignore
		$dims = function_exists( 'wp_getimagesize' ) ? wp_getimagesize( $path ) : false; // phpcs:ignore
		$width  = ! empty( $dims[0] ) ? (int) $dims[0] : 0;
		$height = ! empty( $dims[1] ) ? (int) $dims[1] : 0;

		$inserted = $wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prepare(
				"INSERT IGNORE INTO " . self::table() . "
				(attachment_id, source_path, source_mime, source_size, original_size, source_width, source_height, target_format, status)
				VALUES (%d, %s, %s, %d, %d, %d, %d, %s, 'pending')",
				$attachment_id,
				$path,
				$mime ?: '',
				$size,
				$size,
				$width,
				$height,
				$target_format
			)
		);

		if ( ! $inserted ) {
			return 0;
		}
		return (int) $wpdb->insert_id;
	}

	/**
	 * Enqueue an attachment by ID using its stored file and current settings.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return int Inserted row ID, or 0 if not an image or already queued.
	 */
	public function enqueue_attachment( $attachment_id ) {
		$file = get_attached_file( $attachment_id );
		if ( ! $file || ! wp_get_image_mime( $file ) ) {
			return 0;
		}
		$target = optipress_get_option( 'convert_to', 'webp' );
		return $this->enqueue( $attachment_id, $file, $target );
	}

	/**
	 * Fetch queue rows for a set of attachment IDs in a single query.
	 *
	 * @param int[] $attachment_ids Attachment IDs.
	 * @return array<int, array<string, mixed>> Map of attachment_id => row.
	 */
	public function get_status_map( array $attachment_ids ) {
		global $wpdb;
		$ids = array_filter( array_map( 'intval', $attachment_ids ) );
		if ( empty( $ids ) ) {
			return array();
		}
		$table  = self::table();
		$ph     = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
		$rows   = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prepare(
				"SELECT attachment_id, status, saved_bytes, source_size, optimized_size, target_format
				FROM {$table} WHERE attachment_id IN ({$ph})",
				...$ids
			),
			ARRAY_A
		);
		$map = array();
		foreach ( (array) $rows as $row ) {
			$map[ (int) $row['attachment_id'] ] = $row;
		}
		return $map;
	}

	/**
	 * Claim a batch of items for processing.
	 *
	 * Reclaims stale "processing" rows (started longer ago than the timeout)
	 * before claiming pending items.
	 *
	 * @param int $batch_size Number of items to claim.
	 * @param int $timeout    Stale threshold in seconds.
	 * @return array<int> Claimed queue item IDs.
	 */
	public function claim_batch( $batch_size, $timeout = 120 ) {
		global $wpdb;
		$table = self::table();

		// Recover stale processing items.
		$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prepare(
				"UPDATE {$table} SET status = 'pending', started_at = NULL
				WHERE status = 'processing' AND started_at < DATE_SUB(NOW(), INTERVAL %d SECOND)",
				$timeout
			)
		);

		$ids = $wpdb->get_col( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prepare(
				"SELECT id FROM {$table} WHERE status = 'pending' ORDER BY id ASC LIMIT %d",
				$batch_size
			)
		);

		if ( ! empty( $ids ) ) {
			$placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
			$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
				$wpdb->prepare(
					"UPDATE {$table} SET status = 'processing', started_at = NOW(), attempts = attempts + 1
					WHERE id IN ({$placeholders})",
					...$ids
				)
			);
		}

		return array_map( 'intval', $ids );
	}

	/**
	 * Mark an item completed and persist measured savings.
	 *
	 * @param int   $id     Queue item ID.
	 * @param array $result ImageEngine result.
	 * @return void
	 */
	public function complete( $id, array $result ) {
		global $wpdb;
		$wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			self::table(),
			array(
				'status'           => 'completed',
				'original_size'    => (int) ( $result['original_size'] ?? 0 ),
				'optimized_size'   => (int) $result['new_size'],
				'saved_bytes'      => (int) $result['saved_bytes'],
				'optimization_ratio' => (float) $result['ratio'],
				'completed_at'     => current_time( 'mysql' ),
				'error_message'    => null,
			),
			array( 'id' => $id ),
			array( '%s', '%d', '%d', '%d', '%f', '%s', null ),
			array( '%d' )
		);

		$this->mark_attachment_optimized( $id );
	}

	/**
	 * Mark an item as failed (or return to pending if attempts remain).
	 *
	 * @param int    $id      Queue item ID.
	 * @param string $message Error message.
	 * @param int    $max_attempts Max attempts before permanent failure.
	 * @return void
	 */
	public function fail( $id, $message, $max_attempts = 3 ) {
		global $wpdb;
		$item = $this->get_item( $id );
		if ( ! $item ) {
			return;
		}
		$attempts = (int) $item['attempts'];
		if ( $attempts >= $max_attempts ) {
			$wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
				self::table(),
				array( 'status' => 'failed', 'error_message' => $message, 'started_at' => null ),
				array( 'id' => $id ),
				array( '%s', '%s', null ),
				array( '%d' )
			);
		} else {
			$wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
				self::table(),
				array( 'status' => 'pending', 'error_message' => $message, 'started_at' => null ),
				array( 'id' => $id ),
				array( '%s', '%s', null ),
				array( '%d' )
			);
		}
	}

	/**
	 * Mark an item as skipped (e.g. output larger than original).
	 *
	 * @param int    $id      Queue item ID.
	 * @param string $reason  Reason text.
	 * @return void
	 */
	public function skip( $id, $reason ) {
		global $wpdb;
		$wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			self::table(),
			array( 'status' => 'skipped', 'error_message' => $reason, 'completed_at' => current_time( 'mysql' ), 'started_at' => null ),
			array( 'id' => $id ),
			array( '%s', '%s', '%s', null ),
			array( '%d' )
		);
	}

	/**
	 * Return failed items to pending for retry.
	 *
	 * @return int Number of items reset.
	 */
	public function retry_failed() {
		global $wpdb;
		return (int) $wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prepare(
				"UPDATE " . self::table() . " SET status = 'pending', error_message = NULL, started_at = NULL WHERE status = 'failed'"
			)
		);
	}

	/**
	 * Get a single queue item.
	 *
	 * @param int $id Item ID.
	 * @return array|null
	 */
	public function get_item( $id ) {
		global $wpdb;
		return $wpdb->get_row( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prepare( "SELECT * FROM " . self::table() . " WHERE id = %d", $id ),
			ARRAY_A
		);
	}

	/**
	 * List queue items filtered by status.
	 *
	 * @param array $filters status, limit, offset, search.
	 * @return array { items, total }
	 */
	public function get_items( array $filters = array() ) {
		global $wpdb;
		$table = self::table();
		$filters = wp_parse_args( $filters, array(
			'status' => '',
			'limit'  => 20,
			'offset' => 0,
			'search' => '',
		) );

		$where = '1=1';
		$params = array();
		if ( $filters['status'] ) {
			$where   .= ' AND status = %s';
			$params[] = $filters['status'];
		}
		if ( $filters['search'] ) {
			$where   .= ' AND source_path LIKE %s';
			$params[] = '%' . $wpdb->esc_like( $filters['search'] ) . '%';
		}

		$total = (int) $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prepare( "SELECT COUNT(*) FROM {$table} WHERE {$where}", ...$params ) // phpcs:ignore
		);

		$items = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prepare(
				"SELECT q.*, p.post_title AS title FROM {$table} q LEFT JOIN {$wpdb->posts} p ON p.ID = q.attachment_id WHERE {$where} ORDER BY q.id DESC LIMIT %d OFFSET %d",
				array_merge( $params, array( (int) $filters['limit'], (int) $filters['offset'] ) )
			),
			ARRAY_A
		);

		return array(
			'items' => $items ?: array(),
			'total' => $total,
		);
	}

	/**
	 * Set the queue control state.
	 *
	 * @param string $status running|paused|stopped.
	 * @return void
	 */
	public function set_control( $status ) {
		update_option( 'optipress_control', array(
			'status'     => $status,
			'updated_at' => time(),
		) );
	}

	/**
	 * Get the queue control state.
	 *
	 * @return array { status, updated_at }
	 */
	public function get_control() {
		$control = get_option( 'optipress_control', array( 'status' => 'stopped', 'updated_at' => 0 ) );
		if ( empty( $control['status'] ) ) {
			$control['status'] = 'stopped';
		}
		return $control;
	}

	/**
	 * Flag the attachment as optimized in WordPress meta.
	 *
	 * @param int $id Queue item ID.
	 * @return void
	 */
	private function mark_attachment_optimized( $id ) {
		$item = $this->get_item( $id );
		if ( $item && $item['attachment_id'] ) {
			update_post_meta( (int) $item['attachment_id'], '_optipress_optimized', time() );
		}
	}

	/**
	 * Aggregate statistics across all queue items.
	 *
	 * @return array<string, mixed>
	 */
	public function get_stats() {
		global $wpdb;
		$table = self::table();

		$row = $wpdb->get_row( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			"SELECT
				COUNT(*) AS total,
				SUM(status = 'completed') AS completed,
				SUM(status = 'pending') AS pending,
				SUM(status = 'processing') AS processing,
				SUM(status = 'failed') AS failed,
				SUM(status = 'skipped') AS skipped,
				SUM(original_size) AS original_total,
				SUM(optimized_size) AS optimized_total,
				SUM(saved_bytes) AS saved_total
			FROM {$table}",
			ARRAY_A
		);

		if ( ! $row ) {
			$row = array(
				'total'            => 0,
				'completed'        => 0,
				'pending'          => 0,
				'processing'       => 0,
				'failed'           => 0,
				'skipped'          => 0,
				'original_total'   => 0,
				'optimized_total'  => 0,
				'saved_total'      => 0,
			);
		}

		$original = (int) ( $row['original_total'] ?? 0 );
		$saved    = (int) ( $row['saved_total'] ?? 0 );
		$row['average_reduction'] = $original > 0 ? round( ( $saved / $original ) * 100, 1 ) : 0;

		return $row;
	}

	/**
	 * Count items by a specific status.
	 *
	 * @param string $status Status slug.
	 * @return int
	 */
	public function count_by_status( $status ) {
		global $wpdb;
		$table = self::table();
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery -- controlled, parameterized.
		return (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$table} WHERE status = %s", $status ) );
	}

	/**
	 * Detailed savings breakdown grouped by source format.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public function get_breakdown() {
		global $wpdb;
		$table = self::table();
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$rows = $wpdb->get_results(
			"SELECT
				source_mime,
				COUNT(*) AS count,
				SUM(original_size) AS original_size,
				SUM(optimized_size) AS optimized_size,
				SUM(saved_bytes) AS saved_bytes
			FROM {$table}
			WHERE status = 'completed'
			GROUP BY source_mime",
			ARRAY_A
		);

		if ( empty( $rows ) ) {
			return array();
		}

		$labels = array(
			'image/jpeg' => 'JPG',
			'image/png'  => 'PNG',
			'image/webp' => 'WebP',
			'image/gif'  => 'GIF',
			'image/avif' => 'AVIF',
		);

		return array_map(
			static function ( $row ) use ( $labels ) {
				$orig = (int) $row['original_size'];
				$opt  = (int) $row['optimized_size'];
				return array(
					'format'        => $labels[ $row['source_mime'] ] ?? $row['source_mime'],
					'mime'          => $row['source_mime'],
					'count'         => (int) $row['count'],
					'original_size' => $orig,
					'optimized_size'=> $opt,
					'saved_bytes'   => (int) $row['saved_bytes'],
					'ratio'         => $orig > 0 ? round( ( ( $orig - $opt ) / $orig ) * 100, 1 ) : 0,
				);
			},
			$rows
		);
	}
}
