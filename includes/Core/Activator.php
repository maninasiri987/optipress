<?php
/**
 * Activation routines: create database tables and default options.
 *
 * @package OptiPress\Core
 */

namespace OptiPress\Core;

use OptiPress\Queue\QueueManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles plugin activation.
 */
class Activator {

	/**
	 * Run on plugin activation.
	 *
	 * @return void
	 */
	public static function activate() {
		QueueManager::install_table();
		self::install_options();
		self::schedule_cron();

		// Store activation timestamp for first-run wizard detection.
		if ( ! get_option( 'optipress_activated_at' ) ) {
			update_option( 'optipress_activated_at', time() );
		}

		flush_rewrite_rules();
	}

	/**
	 * Seed default settings.
	 *
	 * @return void
	 */
	private static function install_options() {
		if ( false === get_option( 'optipress_settings' ) ) {
			$defaults = array(
				'automation_mode'   => 'automatic', // automatic | immediate | manual.
				'backup_enabled'    => true,
				'quality'           => 82,
				'max_width'         => 1920,
				'max_height'        => 1920,
				'convert_to'        => 'webp', // original | webp | avif.
				'strip_metadata'    => true,
				'schedule_start'    => '01:00',
				'schedule_end'      => '05:00',
				'schedule_days'     => array( 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun' ),
				'batch_size'        => 20,
				'max_attempts'      => 3,
				'process_timeout'   => 120, // seconds before a "processing" item is considered stale.
			'debug_logging'     => false,
			'wc_product_images' => true,
			'theme'             => 'light', // light | dark.
		);
			add_option( 'optipress_settings', $defaults );
		}

		if ( false === get_option( 'optipress_db_version' ) ) {
			add_option( 'optipress_db_version', OPTIPRESS_VERSION );
		}
	}

	/**
	 * Register the background processing cron schedule.
	 *
	 * @return void
	 */
	private static function schedule_cron() {
		if ( ! wp_next_scheduled( 'optipress_process_queue' ) ) {
			wp_schedule_event( time(), 'optipress_every_minute', 'optipress_process_queue' );
		}
	}
}
