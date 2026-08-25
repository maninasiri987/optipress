<?php
/**
 * Statistics & OptiPress optimization score.
 *
 * All numbers are derived from real queue/media data. No statistics are
 * fabricated. The score combines measurable factors documented inline.
 *
 * @package OptiPress\Stats
 */

namespace OptiPress\Stats;

use OptiPress\Queue\QueueManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Computes dashboard statistics, savings estimates, and the OptiPress score.
 */
class Statistics {

	/**
	 * Compute the OptiPress optimization score (0-100).
	 *
	 * Factors (documented for transparency):
	 *  - 45 pts: proportion of the library that is optimized (completed / total).
	 *  - 20 pts: coverage of remaining optimizable size (pending original size
	 *            weighted, penalized when large).
	 *  - 15 pts: modern-format usage (webp/avif share among completed).
	 *  - 10 pts: low failed ratio.
	 *  - 10 pts: no stuck processing items.
	 *
	 * @return array { score, factors }
	 */
	public function score() {
		$queue = new QueueManager();
		$stats = $queue->get_stats();

		$total      = (int) ( $stats['total'] ?? 0 );
		$completed  = (int) ( $stats['completed'] ?? 0 );
		$failed     = (int) ( $stats['failed'] ?? 0 );
		$processing = (int) ( $stats['processing'] ?? 0 );
		$pending    = (int) ( $stats['pending'] ?? 0 );

		$factors = array();

		// 1) Optimization coverage.
		$coverage = $total > 0 ? ( $completed / $total ) : 0;
		$factors['coverage'] = round( $coverage * 45, 1 );

		// 2) Remaining optimizable size ratio (less pending size = higher).
		$original_total = (int) ( $stats['original_total'] ?? 0 );
		$pending_size   = $this->pending_original_size();
		$size_ratio = $original_total > 0 ? ( $pending_size / $original_total ) : 0;
		$factors['remaining_size'] = round( ( 1 - min( 1, $size_ratio ) ) * 20, 1 );

		// 3) Modern format usage among completed items.
		$modern = $this->completed_modern_count();
		$modern_ratio = $completed > 0 ? ( $modern / $completed ) : 0;
		$factors['modern_format'] = round( $modern_ratio * 15, 1 );

		// 4) Failed ratio penalty.
		$failed_ratio = $total > 0 ? ( $failed / $total ) : 0;
		$factors['reliability'] = round( max( 0, 1 - $failed_ratio ) * 10, 1 );

		// 5) No stuck processing.
		$factors['responsiveness'] = $processing > 0 ? 0 : 10;

		$score = (int) round(
			$factors['coverage'] + $factors['remaining_size'] + $factors['modern_format']
			+ $factors['reliability'] + $factors['responsiveness']
		);

		return array(
			'score'   => max( 0, min( 100, $score ) ),
			'factors' => $factors,
		);
	}

	/**
	 * Estimate potential savings for remaining pending items.
	 *
	 * Uses the realized average reduction from completed items applied to the
	 * remaining pending original size. This is an estimate, not a guarantee.
	 *
	 * @return array { pending_count, pending_size, estimated_saved, estimated_percent }
	 */
	public function estimate() {
		$queue = new QueueManager();
		$stats = $queue->get_stats();

		$pending_count = (int) ( $stats['pending'] ?? 0 ) + (int) ( $stats['processing'] ?? 0 );
		$pending_size  = $this->pending_original_size();
		$avg_ratio     = (float) ( $stats['average_reduction'] ?? 0 );

		$estimated_saved = 0;
		if ( $avg_ratio > 0 && $pending_size > 0 ) {
			$estimated_saved = (int) ( $pending_size * ( $avg_ratio / 100 ) );
		}

		return array(
			'pending_count'     => $pending_count,
			'pending_size'      => $pending_size,
			'estimated_saved'   => $estimated_saved,
			'estimated_percent' => $avg_ratio,
		);
	}

	/**
	 * Sum of original sizes for pending (not yet completed) items.
	 *
	 * @return int
	 */
	private function pending_original_size() {
		global $wpdb;
		$table = QueueManager::table();
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery
		return (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COALESCE(SUM(source_size),0) FROM {$table} WHERE status IN (%s,%s)",
				'pending',
				'processing'
			)
		);
	}

	/**
	 * Count completed items whose target format is modern (webp/avif).
	 *
	 * @return int
	 */
	private function completed_modern_count() {
		global $wpdb;
		$table = QueueManager::table();
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery
		return (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$table} WHERE status = %s AND target_format IN (%s,%s)",
				'completed',
				'webp',
				'avif'
			)
		);
	}
}
