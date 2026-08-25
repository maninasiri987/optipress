<?php
/**
 * OptiPress global helper functions.
 *
 * @package OptiPress
 */

if ( ! function_exists( 'optipress_asset' ) ) {
	/**
	 * Build a versioned URL to a built frontend asset.
	 *
	 * @param string $path Relative path inside assets/dist.
	 * @return string
	 */
	function optipress_asset( $path ) {
		return OPTIPRESS_URL . 'assets/dist/' . ltrim( $path, '/' );
	}
}

if ( ! function_exists( 'optipress_is_woocommerce_active' ) ) {
	/**
	 * Whether WooCommerce is installed and active.
	 *
	 * @return bool
	 */
	function optipress_is_woocommerce_active() {
		return class_exists( 'WooCommerce' ) || function_exists( 'WC' );
	}
}

if ( ! function_exists( 'optipress_get_option' ) ) {
	/**
	 * Get a single OptiPress setting with a fallback default.
	 *
	 * @param string $key     Setting key.
	 * @param mixed  $default Default value.
	 * @return mixed
	 */
	function optipress_get_option( $key, $default = null ) {
		$options = get_option( 'optipress_settings', array() );
		if ( isset( $options[ $key ] ) ) {
			return $options[ $key ];
		}
		return $default;
	}
}

if ( ! function_exists( 'optipress_update_option' ) ) {
	/**
	 * Update a single OptiPress setting.
	 *
	 * @param string $key   Setting key.
	 * @param mixed  $value Setting value.
	 * @return bool
	 */
	function optipress_update_option( $key, $value ) {
		$options         = get_option( 'optipress_settings', array() );
		$options[ $key ] = $value;
		return update_option( 'optipress_settings', $options );
	}
}

if ( ! function_exists( 'optipress_log' ) ) {
	/**
	 * Write a structured log entry.
	 *
	 * @param string $level   One of: info, warning, error, success.
	 * @param string $message Human readable message.
	 * @param array  $context Optional structured context.
	 * @return void
	 */
	function optipress_log( $level, $message, array $context = array() ) {
		\OptiPress\Logging\Logger::instance()->log( $level, $message, $context );
	}
}
