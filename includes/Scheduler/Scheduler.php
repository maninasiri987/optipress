<?php
/**
 * Background scheduler.
 *
 * Triggered by WP-Cron (every minute). Honors the queue control state and the
 * night schedule window. Uses only short, resumable batches. Never relies on a
 * long-running process or daemon.
 *
 * @package OptiPress\Scheduler
 */

namespace OptiPress\Scheduler;

use OptiPress\Queue\QueueManager;
use OptiPress\Optimizer\Processor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Schedules and runs background optimization.
 */
class Scheduler {

	/**
	 * Cron hook name.
	 *
	 * @var string
	 */
	const HOOK = 'optipress_process_queue';

	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_action( self::HOOK, array( $this, 'run' ) );
	}

	/**
	 * Cron callback. Decides whether to process a batch.
	 *
	 * @return void
	 */
	public function run() {
		$queue   = new QueueManager();
		$control = $queue->get_control();

		if ( 'stopped' === $control['status'] || 'paused' === $control['status'] ) {
			return;
		}

		$mode = (string) optipress_get_option( 'automation_mode', 'automatic' );

		if ( 'manual' === $mode ) {
			// Manual mode: only explicit user actions process the queue.
			return;
		}

		if ( 'automatic' === $mode && ! $this->in_schedule_window() ) {
			// Outside the allowed window: keep progress, resume next window.
			return;
		}

		// 'immediate' mode, or 'automatic' inside the window: process a batch.
		$processor = new Processor();
		$summary = $processor->process_batch();

		optipress_log( 'info', __( 'پردازش زمان‌بندی‌شده اجرا شد.', 'optipress' ), $summary );

		// Auto-stop when nothing remains.
		if ( (int) $queue->count_by_status( 'pending' ) === 0 && (int) $queue->count_by_status( 'processing' ) === 0 ) {
			$queue->set_control( 'stopped' );
		}
	}

	/**
	 * Whether the current time is within the configured schedule window.
	 *
	 * @return bool
	 */
	private function in_schedule_window() {
		$start = optipress_get_option( 'schedule_start', '01:00' );
		$end   = optipress_get_option( 'schedule_end', '05:00' );
		$days  = optipress_get_option( 'schedule_days', array() );

		$wp_timezone = wp_timezone();
		$now = new \DateTime( 'now', $wp_timezone );

		$today = strtolower( $now->format( 'D' ) );
		$day_map = array(
			'mon' => 'mon',
			'tue' => 'tue',
			'wed' => 'wed',
			'thu' => 'thu',
			'fri' => 'fri',
			'sat' => 'sat',
			'sun' => 'sun',
		);
		if ( ! empty( $days ) && ! in_array( $day_map[ $today ], $days, true ) ) {
			return false;
		}

		$current = (int) $now->format( 'G' ) * 60 + (int) $now->format( 'i' );
		$start_min = $this->to_minutes( $start );
		$end_min   = $this->to_minutes( $end );

		if ( $start_min === $end_min ) {
			return true; // 24h window.
		}
		if ( $start_min < $end_min ) {
			return $current >= $start_min && $current < $end_min;
		}
		// Window crosses midnight.
		return $current >= $start_min || $current < $end_min;
	}

	/**
	 * Convert HH:MM to minutes since midnight.
	 *
	 * @param string $time HH:MM.
	 * @return int
	 */
	private function to_minutes( $time ) {
		$parts = explode( ':', $time );
		return (int) ( $parts[0] ?? 0 ) * 60 + (int) ( $parts[1] ?? 0 );
	}
}
