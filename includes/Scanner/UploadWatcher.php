<?php
/**
 * Upload watcher.
 *
 * Detects newly uploaded images (including WooCommerce product images) and
 * enqueues them for optimization. Honors the automation mode. This is how
 * "automatic" and "immediate" modes work without a daemon: the cron scheduler
 * later drains the queue in short batches.
 *
 * @package OptiPress\Scanner
 */

namespace OptiPress\Scanner;

use OptiPress\Queue\QueueManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Watches attachment uploads and enqueues them.
 */
class UploadWatcher {

	/**
	 * Register the upload hook.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'add_attachment', array( $this, 'on_upload' ), 20, 1 );
	}

	/**
	 * Handle a newly added attachment.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return void
	 */
	public function on_upload( $attachment_id ) {
		$mode = (string) optipress_get_option( 'automation_mode', 'automatic' );
		if ( 'manual' === $mode ) {
			return;
		}

		$mime = get_post_field( 'post_mime_type', $attachment_id );
		if ( ! in_array( $mime, array( 'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif' ), true ) ) {
			return;
		}

		$path = get_attached_file( $attachment_id );
		if ( ! $path ) {
			return;
		}

		$target = (string) optipress_get_option( 'convert_to', 'webp' );
		$queue  = new QueueManager();
		$queue->enqueue( $attachment_id, $path, $target );

		// Wake the scheduler so the cron drains the queue (respecting window).
		$control = $queue->get_control();
		if ( 'stopped' === $control['status'] ) {
			$queue->set_control( 'running' );
		}
	}
}
