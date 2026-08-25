<?php
/**
 * Main plugin container. Wires together every OptiPress subsystem.
 *
 * @package OptiPress\Core
 */

namespace OptiPress\Core;

use OptiPress\Admin\AdminPage;
use OptiPress\API\RestController;
use OptiPress\Compatibility\SystemChecker;
use OptiPress\Logging\Logger;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Plugin bootstrap container.
 */
class Plugin {

	/**
	 * Singleton instance.
	 *
	 * @var Plugin|null
	 */
	private static $instance = null;

	/**
	 * Subsystem instances.
	 *
	 * @var array<string, object>
	 */
	private $modules = array();

	/**
	 * Return the singleton instance.
	 *
	 * @return Plugin
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Run the plugin: register hooks and boot subsystems.
	 *
	 * @return void
	 */
	public function run() {
		load_plugin_textdomain(
			'optipress',
			false,
			basename( OPTIPRESS_DIR ) . '/languages'
		);

		$this->modules['logger']         = Logger::instance();
		$this->modules['system_checker'] = new SystemChecker();
		$this->modules['admin']          = new AdminPage();
		$this->modules['rest']           = new RestController();
		$this->modules['scheduler']      = new \OptiPress\Scheduler\Scheduler();
		$this->modules['upload_watcher'] = new \OptiPress\Scanner\UploadWatcher();
		$this->modules['woocommerce']    = new \OptiPress\WooCommerce\WooCommerceIntegration();

		foreach ( $this->modules as $module ) {
			if ( method_exists( $module, 'register' ) ) {
				$module->register();
			}
		}

		( new Settings() )->register();
	}

	/**
	 * Access a registered module.
	 *
	 * @param string $key Module key.
	 * @return object|null
	 */
	public function module( $key ) {
		return $this->modules[ $key ] ?? null;
	}
}
