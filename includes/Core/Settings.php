<?php
/**
 * Settings registration and sanitization.
 *
 * @package OptiPress\Core
 */

namespace OptiPress\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the optipress_settings option and provides sanitization.
 */
class Settings {

	/**
	 * Option key.
	 *
	 * @var string
	 */
	const OPTION_KEY = 'optipress_settings';

	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function register() {
		register_setting(
			'optipress_settings',
			self::OPTION_KEY,
			array(
				'sanitize_callback' => array( $this, 'sanitize' ),
				'default'           => array(),
			)
		);

		add_filter( 'cron_schedules', array( $this, 'register_cron_interval' ) );
	}

	/**
	 * Register a one-minute cron interval used by the queue scheduler.
	 *
	 * @param array $intervals Existing intervals.
	 * @return array
	 */
	public function register_cron_interval( $intervals ) {
		$intervals['optipress_every_minute'] = array(
			'interval' => 60,
			'display'  => __( 'هر یک دقیقه (OptiPress)', 'optipress' ),
		);
		return $intervals;
	}

	/**
	 * Sanitize and validate settings submitted from the dashboard.
	 *
	 * @param mixed $input Raw input.
	 * @return array
	 */
	public function sanitize( $input ) {
		if ( ! is_array( $input ) ) {
			return array();
		}

		$current = get_option( self::OPTION_KEY, array() );
		$clean   = array();

		$clean['automation_mode'] = in_array( $input['automation_mode'] ?? '', array( 'automatic', 'immediate', 'manual' ), true )
			? $input['automation_mode']
			: ( $current['automation_mode'] ?? 'automatic' );

		$clean['backup_enabled'] = ! empty( $input['backup_enabled'] );
		$clean['quality']        = $this->clamp_int( $input['quality'] ?? 82, 10, 100 );
		$clean['max_width']      = $this->clamp_int( $input['max_width'] ?? 1920, 0, 10000 );
		$clean['max_height']     = $this->clamp_int( $input['max_height'] ?? 1920, 0, 10000 );
		$clean['convert_to']     = in_array( $input['convert_to'] ?? '', array( 'original', 'webp', 'avif' ), true )
			? $input['convert_to']
			: ( $current['convert_to'] ?? 'webp' );
		$clean['strip_metadata'] = ! empty( $input['strip_metadata'] );

		$clean['schedule_start'] = $this->sanitize_time( $input['schedule_start'] ?? '01:00' );
		$clean['schedule_end']   = $this->sanitize_time( $input['schedule_end'] ?? '05:00' );
		$clean['schedule_days']  = $this->sanitize_days( $input['schedule_days'] ?? array() );

		$clean['batch_size']      = $this->clamp_int( $input['batch_size'] ?? 20, 1, 200 );
		$clean['max_attempts']    = $this->clamp_int( $input['max_attempts'] ?? 3, 1, 10 );
		$clean['process_timeout'] = $this->clamp_int( $input['process_timeout'] ?? 120, 30, 3600 );

		$clean['debug_logging']     = ! empty( $input['debug_logging'] );
		$clean['wc_product_images'] = ! empty( $input['wc_product_images'] );

		return $clean;
	}

	/**
	 * Clamp an integer between bounds.
	 *
	 * @param mixed $value Raw value.
	 * @param int   $min   Minimum.
	 * @param int   $max   Maximum.
	 * @return int
	 */
	private function clamp_int( $value, $min, $max ) {
		$v = (int) $value;
		return min( $max, max( $min, $v ) );
	}

	/**
	 * Sanitize an HH:MM time string.
	 *
	 * @param string $value Raw value.
	 * @return string
	 */
	private function sanitize_time( $value ) {
		if ( preg_match( '/^([01]\d|2[0-3]):([0-5]\d)$/', $value ) ) {
			return $value;
		}
		return '00:00';
	}

	/**
	 * Sanitize day-of-week selection.
	 *
	 * @param mixed $value Raw value.
	 * @return array
	 */
	private function sanitize_days( $value ) {
		$allowed = array( 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun' );
		if ( ! is_array( $value ) ) {
			return $allowed;
		}
		return array_values( array_intersect( $allowed, $value ) );
	}
}
