<?php
/**
 * Optimization processor.
 *
 * Ties the queue, image engine and backup manager together to process batches
 * safely. Used by both the scheduler (cron) and manual "optimize now" actions.
 *
 * @package OptiPress\Optimizer
 */

namespace OptiPress\Optimizer;

use OptiPress\Image\ImageEngine;
use OptiPress\Queue\QueueManager;
use OptiPress\Backup\BackupManager;
use OptiPress\Compatibility\SystemChecker;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Processes claimed queue batches.
 */
class Processor {

	/**
	 * @var QueueManager
	 */
	private $queue;

	/**
	 * @var ImageEngine
	 */
	private $engine;

	/**
	 * @var BackupManager
	 */
	private $backup;

	/**
	 * Constructor.
	 *
	 * @param QueueManager|null  $queue  Queue manager.
	 * @param ImageEngine|null   $engine Image engine.
	 * @param BackupManager|null $backup Backup manager.
	 */
	public function __construct( $queue = null, $engine = null, $backup = null ) {
		$this->queue  = $queue ?: new QueueManager();
		$this->engine = $engine ?: new ImageEngine( new SystemChecker() );
		$this->backup = $backup ?: new BackupManager();
	}

	/**
	 * Process one batch from the queue.
	 *
	 * @param int $batch_size Batch size (defaults to setting).
	 * @return array Summary { processed, completed, skipped, failed, saved_bytes }
	 */
	public function process_batch( $batch_size = 0 ) {
		if ( $batch_size <= 0 ) {
			$batch_size = (int) optipress_get_option( 'batch_size', 20 );
		}
		$timeout = (int) optipress_get_option( 'process_timeout', 120 );
		$max_attempts = (int) optipress_get_option( 'max_attempts', 3 );

		$ids = $this->queue->claim_batch( $batch_size, $timeout );
		$summary = array(
			'processed'    => 0,
			'completed'    => 0,
			'skipped'     => 0,
			'failed'      => 0,
			'saved_bytes' => 0,
		);

		if ( empty( $ids ) ) {
			return $summary;
		}

		$options = array(
			'quality'        => (int) optipress_get_option( 'quality', 82 ),
			'max_width'      => (int) optipress_get_option( 'max_width', 1920 ),
			'max_height'     => (int) optipress_get_option( 'max_height', 1920 ),
			'target_format'  => (string) optipress_get_option( 'convert_to', 'webp' ),
			'strip_metadata' => (bool) optipress_get_option( 'strip_metadata', true ),
		);

		$backup_enabled = (bool) optipress_get_option( 'backup_enabled', true );

		foreach ( $ids as $id ) {
			$item = $this->queue->get_item( $id );
			if ( ! $item ) {
				continue;
			}

			$summary['processed']++;

			if ( $backup_enabled ) {
				$this->backup->backup( (int) $item['attachment_id'], $item['source_path'] );
			}

			$result = $this->engine->optimize(
				(int) $item['attachment_id'],
				$item['source_path'],
				$options
			);

			if ( ! empty( $result['success'] ) ) {
				$this->queue->complete( $id, $result );
				$summary['completed']++;
				$summary['saved_bytes'] += (int) $result['saved_bytes'];
				optipress_log( 'success', __( 'تصویر بهینه شد.', 'optipress' ), array(
					'attachment_id' => $item['attachment_id'],
					'saved_bytes'   => $result['saved_bytes'],
				) );
			} elseif ( ! empty( $result['skipped'] ) ) {
				$this->queue->skip( $id, $result['reason'] );
				$summary['skipped']++;
				optipress_log( 'info', $result['reason'], array( 'attachment_id' => $item['attachment_id'] ) );
			} else {
				$this->queue->fail( $id, $result['reason'], $max_attempts );
				$summary['failed']++;
				optipress_log( 'error', $result['reason'], array( 'attachment_id' => $item['attachment_id'] ) );
			}
		}

		return $summary;
	}
}
