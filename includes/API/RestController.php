<?php
/**
 * REST API controller. Exposes the OptiPress/v1 namespace and all endpoints.
 *
 * Every route uses a capability check plus nonce verification at the
 * permission_callback level. REST payloads are never trusted blindly.
 *
 * @package OptiPress\API
 */

namespace OptiPress\API;

use OptiPress\Compatibility\SystemChecker;
use OptiPress\Queue\QueueManager;
use OptiPress\Scanner\Scanner;
use OptiPress\Optimizer\Processor;
use OptiPress\Backup\BackupManager;
use OptiPress\Stats\Statistics;
use OptiPress\Logging\Logger;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers and handles OptiPress REST endpoints.
 */
class RestController {

	/**
	 * REST namespace.
	 *
	 * @var string
	 */
	const NAMESPACE = 'optipress/v1';

	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Define endpoints.
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			self::NAMESPACE,
			'/compatibility',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_compatibility' ),
				'permission_callback' => array( $this, 'admin_permission' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/stats',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_stats' ),
				'permission_callback' => array( $this, 'admin_permission' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/statistics',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_statistics' ),
				'permission_callback' => array( $this, 'admin_permission' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/settings',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'admin_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'admin_permission' ),
					'args'                => $this->settings_args(),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/scan',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'run_scan' ),
				'permission_callback' => array( $this, 'admin_permission' ),
				'args'                => array(
					'scope'       => array( 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ),
					'min_size_mb' => array( 'type' => 'number', 'sanitize_callback' => 'floatval' ),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/queue',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_queue' ),
				'permission_callback' => array( $this, 'admin_permission' ),
				'args'                => array(
					'status' => array( 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ),
					'limit'  => array( 'type' => 'integer', 'sanitize_callback' => 'absint' ),
					'offset' => array( 'type' => 'integer', 'sanitize_callback' => 'absint' ),
					'search' => array( 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/queue/start',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'queue_start' ),
				'permission_callback' => array( $this, 'admin_permission' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/queue/pause',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'queue_pause' ),
				'permission_callback' => array( $this, 'admin_permission' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/queue/resume',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'queue_resume' ),
				'permission_callback' => array( $this, 'admin_permission' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/queue/stop',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'queue_stop' ),
				'permission_callback' => array( $this, 'admin_permission' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/queue/retry',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'queue_retry' ),
				'permission_callback' => array( $this, 'admin_permission' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/queue/process',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'queue_process' ),
				'permission_callback' => array( $this, 'admin_permission' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/backup/restore',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'backup_restore' ),
				'permission_callback' => array( $this, 'admin_permission' ),
				'args'                => array(
					'attachment_id' => array( 'type' => 'integer', 'sanitize_callback' => 'absint', 'required' => true ),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/reports',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_reports' ),
				'permission_callback' => array( $this, 'admin_permission' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/attachment/(?P<id>\d+)/status',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_attachment_status' ),
				'permission_callback' => array( $this, 'admin_permission' ),
				'args'                => array(
					'id' => array( 'type' => 'integer', 'sanitize_callback' => 'absint', 'required' => true ),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/attachment/(?P<id>\d+)/restore',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'restore_attachment' ),
				'permission_callback' => array( $this, 'admin_permission' ),
				'args'                => array(
					'id' => array( 'type' => 'integer', 'sanitize_callback' => 'absint', 'required' => true ),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/logs',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_logs' ),
				'permission_callback' => array( $this, 'admin_permission' ),
				'args'                => array(
					'level' => array( 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ),
					'limit' => array( 'type' => 'integer', 'sanitize_callback' => 'absint' ),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/logs/clear',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'clear_logs' ),
				'permission_callback' => array( $this, 'admin_permission' ),
			)
		);
	}

	/**
	 * Permission: only administrators (or users who can manage options).
	 *
	 * @return bool|\WP_Error
	 */
	public function admin_permission() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new \WP_Error(
				'optipress_forbidden',
				__( 'شما دسترسی لازم برای این عملیات را ندارید.', 'optipress' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}
		return true;
	}

	/**
	 * GET /compatibility — environment capability report.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_compatibility() {
		$checker = new SystemChecker();
		return rest_ensure_response(
			array(
				'ok'        => $checker->is_ok(),
				'processor' => $checker->preferred_processor(),
				'checks'    => $checker->check(),
			)
		);
	}

	/**
	 * GET /stats — queue/dashboard statistics.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_stats() {
		$stats = ( new QueueManager() )->get_stats();
		return rest_ensure_response( $stats );
	}

	/**
	 * GET /statistics — score + estimate.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_statistics() {
		$stats = new Statistics();
		return rest_ensure_response(
			array(
				'score'    => $stats->score(),
				'estimate' => $stats->estimate(),
			)
		);
	}

	/**
	 * GET|POST /settings.
	 *
	 * @param \WP_REST_Request|null $request Request (null on GET).
	 * @return \WP_REST_Response
	 */
	public function get_settings( $request = null ) {
		$settings = get_option( 'optipress_settings', array() );
		$next     = wp_next_scheduled( 'optipress_process_queue' );
		$settings['next_run'] = $next ? (int) $next : 0;
		return rest_ensure_response( $settings );
	}

	/**
	 * POST /settings — persist settings.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function update_settings( $request ) {
		$input    = $request->get_json_params() ?: $request->get_params();
		$sanitized = ( new \OptiPress\Core\Settings() )->sanitize( $input );
		update_option( 'optipress_settings', $sanitized );
		optipress_log( 'info', __( 'تنظیمات به‌روزرسانی شد.', 'optipress' ) );
		return rest_ensure_response( array( 'success' => true, 'settings' => $sanitized ) );
	}

	/**
	 * POST /scan — enqueue matching attachments.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function run_scan( $request ) {
		$scope = $request->get_param( 'scope' ) ?: 'all';
		$scope = in_array( $scope, array( 'all', 'unoptimized', 'above_size', 'formats', 'product_images' ), true )
			? $scope : 'all';

		$result = ( new Scanner() )->scan(
			array(
				'scope'       => $scope,
				'min_size_mb' => (float) $request->get_param( 'min_size_mb' ),
			)
		);

		return rest_ensure_response( $result );
	}

	/**
	 * GET /queue — list items + control state + stats.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function get_queue( $request ) {
		$queue = new QueueManager();
		$list  = $queue->get_items(
			array(
				'status' => $request->get_param( 'status' ) ?: '',
				'limit'  => (int) ( $request->get_param( 'limit' ) ?: 20 ),
				'offset' => (int) ( $request->get_param( 'offset' ) ?: 0 ),
				'search' => $request->get_param( 'search' ) ?: '',
			)
		);

		return rest_ensure_response(
			array(
				'items'   => $list['items'],
				'total'   => $list['total'],
				'control' => $queue->get_control(),
				'stats'   => $queue->get_stats(),
			)
		);
	}

	/**
	 * POST /queue/start — begin processing and run one batch immediately.
	 *
	 * @return \WP_REST_Response
	 */
	public function queue_start() {
		$queue = new QueueManager();
		$queue->set_control( 'running' );
		$summary = ( new Processor() )->process_batch();
		$this->maybe_stop( $queue );
		return rest_ensure_response(
			array( 'control' => $queue->get_control(), 'summary' => $summary, 'stats' => $queue->get_stats() )
		);
	}

	/**
	 * POST /queue/pause.
	 *
	 * @return \WP_REST_Response
	 */
	private function maybe_stop( $queue ) {
		if ( (int) $queue->count_by_status( 'pending' ) === 0 && (int) $queue->count_by_status( 'processing' ) === 0 ) {
			$queue->set_control( 'stopped' );
		}
	}

	public function queue_pause() {
		$queue = new QueueManager();
		$queue->set_control( 'paused' );
		return rest_ensure_response( array( 'control' => $queue->get_control() ) );
	}

	/**
	 * POST /queue/resume.
	 *
	 * @return \WP_REST_Response
	 */
	public function queue_resume() {
		$queue = new QueueManager();
		$queue->set_control( 'running' );
		$summary = ( new Processor() )->process_batch();
		$this->maybe_stop( $queue );
		return rest_ensure_response(
			array( 'control' => $queue->get_control(), 'summary' => $summary, 'stats' => $queue->get_stats() )
		);
	}

	/**
	 * POST /queue/stop.
	 *
	 * @return \WP_REST_Response
	 */
	public function queue_stop() {
		$queue = new QueueManager();
		$queue->set_control( 'stopped' );
		return rest_ensure_response( array( 'control' => $queue->get_control() ) );
	}

	/**
	 * POST /queue/retry — reset failed items and resume.
	 *
	 * @return \WP_REST_Response
	 */
	public function queue_retry() {
		$queue = new QueueManager();
		$reset = $queue->retry_failed();
		$queue->set_control( 'running' );
		$summary = ( new Processor() )->process_batch();
		$this->maybe_stop( $queue );
		return rest_ensure_response(
			array( 'reset' => $reset, 'control' => $queue->get_control(), 'summary' => $summary, 'stats' => $queue->get_stats() )
		);
	}

	/**
	 * POST /queue/process — run one batch now (live progress, browser-led).
	 *
	 * @return \WP_REST_Response
	 */
	public function queue_process() {
		$queue = new QueueManager();
		$queue->set_control( 'running' );
		$summary = ( new Processor() )->process_batch();
		$this->maybe_stop( $queue );
		return rest_ensure_response(
			array( 'summary' => $summary, 'stats' => $queue->get_stats(), 'control' => $queue->get_control() )
		);
	}

	/**
	 * POST /backup/restore.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function backup_restore( $request ) {
		$attachment_id = (int) $request->get_param( 'attachment_id' );
		$ok = ( new BackupManager() )->restore( $attachment_id );
		return rest_ensure_response(
			array(
				'success' => $ok,
				'message' => $ok ? __( 'نسخه اصلی بازیابی شد.', 'optipress' )
								: __( 'فایل پشتیبان یافت نشد.', 'optipress' ),
			)
		);
	}

	/**
	 * GET /reports — detailed breakdown by format.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_reports() {
		$queue     = new QueueManager();
		$breakdown = $queue->get_breakdown();
		$stats     = $queue->get_stats();
		$score     = ( new Statistics() )->score();

		return rest_ensure_response(
			array(
				'stats'     => $stats,
				'breakdown' => $breakdown,
				'score'     => $score['score'],
			)
		);
	}

	/**
	 * GET /attachment/{id}/status — optimization state for a single attachment.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function get_attachment_status( $request ) {
		$id    = (int) $request->get_param( 'id' );
		$queue = new QueueManager();
		$map   = $queue->get_status_map( array( $id ) );
		$row   = $map[ $id ] ?? null;

		$status = $row ? $row['status'] : 'none';
		$saved  = $row ? (int) ( $row['saved_bytes'] ?? 0 ) : 0;
		$src    = $row ? (int) ( $row['source_size'] ?? 0 ) : 0;

		return rest_ensure_response(
			array(
				'attachment_id' => $id,
				'status'        => $status,
				'saved_bytes'   => $saved,
				'source_size'   => $src,
				'ratio'         => $src > 0 ? round( ( $saved / $src ) * 100 ) : 0,
				'has_backup'    => ( new BackupManager() )->has_backup( $id ),
			)
		);
	}

	/**
	 * POST /attachment/{id}/restore — restore original for a single attachment.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function restore_attachment( $request ) {
		$id  = (int) $request->get_param( 'id' );
		$ok  = ( new BackupManager() )->restore( $id );
		return rest_ensure_response(
			array(
				'success' => $ok,
				'message' => $ok ? __( 'نسخه اصلی بازیابی شد.', 'optipress' )
								: __( 'فایل پشتیبان یافت نشد.', 'optipress' ),
			)
		);
	}

	/**
	 * Argument schema for settings endpoint.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	private function settings_args() {
		return array(
			'automation_mode' => array( 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ),
			'quality'         => array( 'type' => 'integer', 'sanitize_callback' => 'absint' ),
			'batch_size'      => array( 'type' => 'integer', 'sanitize_callback' => 'absint' ),
			'backup_enabled'  => array( 'type' => 'boolean' ),
			'convert_to'      => array( 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ),
		);
	}

	/**
	 * GET /logs — recent activity log entries (kept in Persian).
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function get_logs( $request ) {
		$level = (string) $request->get_param( 'level' );
		$limit = (int) $request->get_param( 'limit' );
		if ( $limit <= 0 || $limit > 500 ) {
			$limit = 200;
		}

		$logs = Logger::instance()->get_logs( 0 );
		if ( $level ) {
			$logs = array_filter(
				$logs,
				function ( $entry ) use ( $level ) {
					return isset( $entry['level'] ) && $entry['level'] === $level;
				}
			);
		}
		$logs = array_slice( array_values( $logs ), 0, $limit );

		return rest_ensure_response(
			array(
				'logs'  => $logs,
				'count' => count( $logs ),
			)
		);
	}

	/**
	 * POST /logs/clear — wipe the activity log.
	 *
	 * @return \WP_REST_Response
	 */
	public function clear_logs() {
		Logger::instance()->clear();
		return rest_ensure_response( array( 'success' => true ) );
	}
}
