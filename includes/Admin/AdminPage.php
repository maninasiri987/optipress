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
			OPTIPRESS_URL . 'assets/icon.png',
			58
		);
	}

	/**
	 * Render the dashboard mount point. The React app hydrates this node.
	 *
	 * @return void
	 */
	public function render_page() {
		echo '<div id="optipress-root" class="optipress-admin-wrap"></div>';
	}

	/**
	 * Output a browser-tab favicon on the OptiPress admin page.
	 *
	 * @return void
	 */
	public function output_favicon() {
		$screen = get_current_screen();
		if ( ! $screen || $screen->id !== $this->hook ) {
			return;
		}
		$url = OPTIPRESS_URL . 'assets/icon.png';
		echo '<link rel="icon" type="image/png" href="' . esc_url( $url ) . '">';
	}

	/**
	 * Enqueue the built React dashboard and localize the API bootstrap.
	 *
	 * @param string $hook_suffix Current admin page hook.
	 * @return void
	 */
	public function enqueue_assets( $hook_suffix ) {
		if ( $hook_suffix !== $this->hook ) {
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

		// Vite emits one manifest entry per HTML input; locate the JS + CSS.
		$js_entry = null;
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

		wp_localize_script(
			'optipress-app',
			'optipressSettings',
			array(
				'apiUrl'      => esc_url_raw( rest_url( 'optipress/v1' ) ),
				'nonce'       => wp_create_nonce( 'wp_rest' ),
				'adminUrl'    => admin_url(),
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
