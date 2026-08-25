<?php
/**
 * Admin menu and dashboard asset bootstrap.
 *
 * Registers the OptiPress admin page and enqueues the built React application
 * plus the WordPress REST nonce for secure API calls.
 *
 * @package OptiPress\Admin
 */

namespace OptiPress\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin page controller.
 */
class AdminPage {

	/**
	 * Page hook suffix for later reference.
	 *
	 * @var string|null
	 */
	private $hook = null;

	/**
	 * Register WordPress hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'admin_head', array( $this, 'output_favicon' ) );
		add_filter( 'admin_body_class', array( $this, 'admin_body_class' ) );
	}

	/**
	 * Add the OptiPress top-level menu.
	 *
	 * @return void
	 */
	public function register_menu() {
		$this->hook = add_menu_page(
			__( 'OptiPress', 'optipress' ),
			__( 'OptiPress', 'optipress' ),
			'manage_options',
			'optipress',
			array( $this, 'render_page' ),
			'dashicons-images-alt2',
			58
		);

		$submenus = array(
			'optipress'             => __( 'داشبورد', 'optipress' ),
			'optipress-scanner'     => __( 'اسکنر', 'optipress' ),
			'optipress-queue'       => __( 'صف بهینه‌سازی', 'optipress' ),
			'optipress-reports'     => __( 'گزارش‌ها', 'optipress' ),
			'optipress-woocommerce' => __( 'ووکامرس', 'optipress' ),
			'optipress-logs'        => __( 'لاگ', 'optipress' ),
			'optipress-settings'    => __( 'تنظیمات', 'optipress' ),
		);
		foreach ( $submenus as $slug => $label ) {
			add_submenu_page(
				'optipress',
				$label,
				$label,
				'manage_options',
				$slug,
				array( $this, 'render_page' )
			);
		}
	}

	/**
	 * Render the dashboard mount point. The React app hydrates this node.
	 *
	 * @return void
	 */
	public function render_page() {
		$theme = (string) optipress_get_option( 'theme', 'light' );
		$cls   = 'optipress-admin-wrap' . ( 'dark' === $theme ? ' dark' : '' );
		echo '<div id="optipress-root" class="' . esc_attr( $cls ) . '"></div>';
	}

	/**
	 * Output a browser-tab favicon on the OptiPress admin page.
	 *
	 * @return void
	 */
	public function output_favicon() {
		$screen = get_current_screen();
		if ( ! $screen || strpos( $screen->id, 'optipress' ) === false ) {
			return;
		}
		$url = OPTIPRESS_URL . 'assets/icon.png';
		echo '<link rel="icon" type="image/png" href="' . esc_url( $url ) . '">';
	}

	/**
	 * Add a body class so the WordPress admin chrome (top bar, left menu,
	 * footer) can be darkened to match OptiPress's dark theme.
	 *
	 * @param string $classes Space-separated body classes.
	 * @return string
	 */
	public function admin_body_class( $classes ) {
		$screen = get_current_screen();
		if ( ! $screen || strpos( $screen->id, 'optipress' ) === false ) {
			return $classes;
		}
		if ( 'dark' === (string) optipress_get_option( 'theme', 'light' ) ) {
			$classes = trim( $classes . ' optipress-dark' );
		}
		return $classes;
	}

	/**
	 * Enqueue the built React dashboard and localize the API bootstrap.
	 *
	 * @param string $hook_suffix Current admin page hook.
	 * @return void
	 */
	public function enqueue_assets( $hook_suffix ) {
		$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( strpos( $page, 'optipress' ) !== 0 ) {
			return;
		}

		$manifest = OPTIPRESS_DIR . 'assets/dist/.vite/manifest.json';
		if ( ! file_exists( $manifest ) ) {
			// Build assets not present yet; nothing to enqueue.
			return;
		}

		$base = optipress_asset( '' );
		$data = json_decode( file_get_contents( $manifest ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		if ( ! is_array( $data ) ) {
			return;
		}

		// Vite emits one manifest entry per HTML input; locate the JS + CSS.		$js_entry = null;
		$css_files = array();
		foreach ( $data as $meta ) {
			if ( isset( $meta['file'] ) && preg_match( '/\.js$/', $meta['file'] ) ) {
				$js_entry = $meta['file'];
			}
			if ( ! empty( $meta['css'] ) ) {
				$css_files = array_merge( $css_files, (array) $meta['css'] );
			}
		}

		foreach ( array_unique( $css_files ) as $index => $css ) {
			wp_enqueue_style( 'optipress-app-' . $index, $base . $css, array(), OPTIPRESS_VERSION );
		}

		if ( $js_entry ) {
			wp_enqueue_script(
				'optipress-app',
				$base . $js_entry,
				array(),
				OPTIPRESS_VERSION,
				true
			);
		}

		$tab_map = array(
			'optipress'             => 'dashboard',
			'optipress-scanner'     => 'scanner',
			'optipress-queue'       => 'queue',
			'optipress-reports'     => 'reports',
			'optipress-woocommerce' => 'woocommerce',
			'optipress-logs'        => 'logs',
			'optipress-settings'    => 'settings',
		);
		$active_tab = isset( $tab_map[ $page ] ) ? $tab_map[ $page ] : 'dashboard';

		wp_localize_script(
			'optipress-app',
			'optipressSettings',
			array(
				'apiUrl'      => esc_url_raw( rest_url( 'optipress/v1' ) ),
				'nonce'       => wp_create_nonce( 'wp_rest' ),
				'adminUrl'    => admin_url(),
				'activeTab'   => $active_tab,
			'pluginUrl'   => OPTIPRESS_URL,
			'assetsUrl'   => OPTIPRESS_URL . 'assets/dist/',
			'iconUrl'     => OPTIPRESS_URL . 'assets/icon.png',
				'textDomain'  => 'optipress',
				'isRtl'       => is_rtl(),
				'woocommerce' => optipress_is_woocommerce_active(),
			)
		);
	}
}
