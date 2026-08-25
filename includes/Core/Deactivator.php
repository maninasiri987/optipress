<?php
/**
 * Deactivation routines.
 *
 * @package OptiPress\Core
 */

namespace OptiPress\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles plugin deactivation.
 */
class Deactivator {

	/**
	 * Run on plugin deactivation.
	 *
	 * @return void
	 */
	public static function deactivate() {
		$timestamp = wp_next_scheduled( 'optipress_process_queue' );
		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, 'optipress_process_queue' );
		}

		flush_rewrite_rules();
	}
}
