<?php
/**
 * OptiPress uninstall: remove plugin data when deleted via WP admin.
 *
 * Backups of original images are preserved by default so a stray uninstall
 * never destroys anyone's media; they can be removed deliberately via the
 * "remove_data" flag in optipress_settings.
 *
 * @package OptiPress
 */

// Abort if WordPress is not uninstalling us.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

global $wpdb;

// 1. Drop the queue table.
$table = $wpdb->prefix . 'optipress_queue';
// phpcs:ignore WordPress.DB.DirectDatabaseQuery
$wpdb->query( "DROP TABLE IF EXISTS {$table}" );

// 2. Delete options.
delete_option( 'optipress_settings' );
delete_option( 'optipress_control' );
delete_option( 'optipress_logs' );
delete_option( 'optipress_db_version' );
delete_option( 'optipress_activated_at' );

// 3. Remove the per-attachment optimization flags.
// phpcs:ignore WordPress.DB.DirectDatabaseQuery
$wpdb->query( "DELETE FROM {$wpdb->postmeta} WHERE meta_key = '_optipress_optimized'" );

// 4. Clean the OptiPress section from .htaccess.
$htaccess = ABSPATH . '.htaccess';
if ( file_exists( $htaccess ) && is_writable( $htaccess ) ) {
	require_once ABSPATH . 'wp-admin/includes/misc.php';
	insert_with_markers( $htaccess, 'OptiPress', array() );
}

// 5. Remove backups ONLY when the admin explicitly opted into data removal.
$settings = get_option( 'optipress_settings', array() );
if ( is_array( $settings ) && ! empty( $settings['remove_data'] ) ) {
	$upload = wp_upload_dir();
	$base   = $upload['basedir'] . '/optipress-backups';

	if ( is_dir( $base ) ) {
		$iterator = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator( $base, FilesystemIterator::SKIP_DOTS ),
			RecursiveIteratorIterator::CHILD_FIRST
		);
		foreach ( $iterator as $item ) {
			if ( $item->isDir() ) {
				@rmdir( $item->getPathname() ); // phpcs:ignore
			} else {
				@unlink( $item->getPathname() ); // phpcs:ignore
			}
		}
		@rmdir( $base ); // phpcs:ignore
	}
}
