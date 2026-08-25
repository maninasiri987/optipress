<?php
/**
 * Plugin Name:       OptiPress
 * Plugin URI:        https://optipress.example/
 * Description:        تصویرساز هوشمند وردپرس و ووکامرس — بهینه‌سازی تصاویر مستقیماً روی هاست شما.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      8.1
 * Author:            OptiPress
 * Author URI:        https://optipress.example/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       optipress
 * Domain Path:       /languages
 *
 * @package           OptiPress
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * OptiPress plugin constants.
 */
if ( ! defined( 'OPTIPRESS_VERSION' ) ) {
	define( 'OPTIPRESS_VERSION', '1.0.0' );
}
if ( ! defined( 'OPTIPRESS_FILE' ) ) {
	define( 'OPTIPRESS_FILE', __FILE__ );
}
if ( ! defined( 'OPTIPRESS_DIR' ) ) {
	define( 'OPTIPRESS_DIR', plugin_dir_path( __FILE__ ) );
}
if ( ! defined( 'OPTIPRESS_URL' ) ) {
	define( 'OPTIPRESS_URL', plugin_dir_url( __FILE__ ) );
}
if ( ! defined( 'OPTIPRESS_BASENAME' ) ) {
	define( 'OPTIPRESS_BASENAME', plugin_basename( __FILE__ ) );
}

/**
 * PSR-4 style autoloader for the OptiPress namespace.
 *
 * Maps the "OptiPress\" namespace to the includes/ directory while keeping
 * the sub-namespace folder structure (e.g. OptiPress\Core -> includes/Core).
 */
spl_autoload_register(
	function ( $class ) {
		$prefix   = 'OptiPress\\';
		$base_dir = OPTIPRESS_DIR . 'includes/';

		$len = strlen( $prefix );
		if ( strncmp( $prefix, $class, $len ) !== 0 ) {
			return;
		}

		$relative_class = substr( $class, $len );
		$file           = $base_dir . str_replace( '\\', '/', $relative_class ) . '.php';

		if ( file_exists( $file ) ) {
			require $file;
		}
	}
);

/**
 * Helper to access the main plugin container instance.
 *
 * @return \OptiPress\Core\Plugin
 */
function optipress() {
	return \OptiPress\Core\Plugin::instance();
}

/**
 * Bootstrap the plugin once all plugins are loaded.
 */
add_action(
	'plugins_loaded',
	static function () {
		require_once OPTIPRESS_DIR . 'includes/functions.php';
		optipress()->run();
	}
);

/**
 * Activation hook.
 */
register_activation_hook(
	__FILE__,
	static function () {
		\OptiPress\Core\Activator::activate();
	}
);

/**
 * Deactivation hook.
 */
register_deactivation_hook(
	__FILE__,
	static function () {
		\OptiPress\Core\Deactivator::deactivate();
	}
);
