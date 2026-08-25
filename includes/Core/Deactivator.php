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
		// Remove every occurrence (not just the next one) and reset control
		// so a reactivation starts from a clean, stopped state.
		wp_clear_scheduled_hook( \OptiPress\Scheduler\Scheduler::HOOK );
		update_option( 'optipress_control', array( 'status' => 'stopped', 'updated_at' => time() ) );

		flush_rewrite_rules();
	}
}
