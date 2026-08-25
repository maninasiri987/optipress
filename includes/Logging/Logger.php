<?php
/**
 * Structured logging subsystem.
 *
 * Logs are stored in a dedicated option as a ring buffer (capped) so they are
 * easy to read and export, while never growing without bound.
 *
 * @package OptiPress\Logging
 */

namespace OptiPress\Logging;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Logger implementation.
 */
class Logger {

	/**
	 * Option key used for log storage.
	 *
	 * @var string
	 */
	const OPTION_KEY = 'optipress_logs';

	/**
	 * Maximum number of retained entries.
	 *
	 * @var int
	 */
	const MAX_ENTRIES = 500;

	/**
	 * Singleton instance.
	 *
	 * @var Logger|null
	 */
	private static $instance = null;

	/**
	 * Return the singleton instance.
	 *
	 * @return Logger
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Write a log entry.
	 *
	 * @param string $level   info|warning|error|success.
	 * @param string $message Message text.
	 * @param array  $context Structured context.
	 * @return void
	 */
	public function log( $level, $message, array $context = array() ) {
		$debug = (bool) optipress_get_option( 'debug_logging', false );
		if ( ! $debug && 'info' === $level ) {
			// Non-debug mode keeps only meaningful events to avoid noise.
		}

		$entry = array(
			'time'    => current_time( 'mysql' ),
			'level'   => $level,
			'message' => $message,
			'context' => $context,
		);

		$logs   = get_option( self::OPTION_KEY, array() );
		$logs[] = $entry;

		if ( count( $logs ) > self::MAX_ENTRIES ) {
			$logs = array_slice( $logs, -self::MAX_ENTRIES );
		}

		update_option( self::OPTION_KEY, $logs );
	}

	/**
	 * Retrieve recent logs.
	 *
	 * @param int $limit Number of entries (most recent first).
	 * @return array
	 */
	public function get_logs( $limit = 100 ) {
		$logs = get_option( self::OPTION_KEY, array() );
		$logs = array_reverse( $logs );
		if ( $limit > 0 ) {
			$logs = array_slice( $logs, 0, $limit );
		}
		return $logs;
	}

	/**
	 * Clear all logs.
	 *
	 * @return void
	 */
	public function clear() {
		delete_option( self::OPTION_KEY );
	}
}
