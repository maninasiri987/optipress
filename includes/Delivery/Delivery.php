<?php
/**
 * Automatic optimized-format delivery.
 *
 * Once an image has been optimized to WebP (or AVIF), this module makes sure
 * the optimized version is served automatically — without manually editing
 * anywhere the image is used:
 *
 *  1. Attachment-based usage (products, post thumbnails, galleries) already
 *     points at the optimized file because the attachment metadata is updated
 *     during optimization. This module reinforces that for URLs too.
 *  2. Hardcoded/static references inside post content, text widgets, etc. are
 *     rewritten on output: <img src="photo.jpg"> becomes photo.webp when the
 *     optimized file exists and the visitor's browser accepts it.
 *  3. On Apache hosts, rewrite rules are written to .htaccess so even direct
 *     static requests (CSS backgrounds, external embeds) are served WebP.
 *
 * @package OptiPress\Delivery
 */

namespace OptiPress\Delivery;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Serves optimized variants automatically.
 */
class Delivery {

	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_filter( 'the_content', array( $this, 'rewrite_content_images' ), 20 );
		add_filter( 'widget_text_content', array( $this, 'rewrite_content_images' ), 20 );
		add_filter( 'wp_get_attachment_url', array( $this, 'filter_attachment_url' ), 10, 2 );
	}

	/**
	 * Rewrite <img> sources (and srcset) inside rendered content to their
	 * optimized WebP/AVIF equivalent when available.
	 *
	 * @param string $content Post content HTML.
	 * @return string
	 */
	public function rewrite_content_images( $content ) {
		if ( empty( $content ) || ! $this->client_supports_webp() ) {
			return $content;
		}

		if ( false === strpos( $content, 'src=' ) && false === strpos( $content, 'srcset=' ) ) {
			return $content;
		}

		$content = preg_replace_callback( '/<img\b[^>]*>/i', array( $this, 'swap_img_tag' ), $content );
		return $content;
	}

	/**
	 * Swap a single <img> tag's src/srcset to the optimized variant.
	 *
	 * @param array $matches Preg matches.
	 * @return string
	 */
	public function swap_img_tag( $matches ) {
		$tag = $matches[0];

		$tag = preg_replace_callback(
			'/\bsrc=["\']([^"\']+\.(?:jpe?g|png|gif))["\']/i',
			array( $this, 'swap_src_attr' ),
			$tag
		);

		$tag = preg_replace_callback(
			'/\bsrcset=["\']([^"\']+)["\']/i',
			array( $this, 'swap_srcset_attr' ),
			$tag
		);

		return $tag;
	}

	/**
	 * Replace a single src attribute value with its optimized variant.
	 *
	 * @param array $matches Preg matches.
	 * @return string
	 */
	public function swap_src_attr( $matches ) {
		$webp = $this->optimized_url( $matches[1] );
		if ( ! $webp ) {
			return $matches[0];
		}
		return 'src="' . $webp . '"';
	}

	/**
	 * Replace every URL inside a srcset with its optimized variant.
	 *
	 * @param array $matches Preg matches.
	 * @return string
	 */
	public function swap_srcset_attr( $matches ) {
		$set = preg_replace_callback(
			'/(\S+\.(?:jpe?g|png|gif))(\s+\d+[wx])?/i',
			array( $this, 'swap_srcset_url' ),
			$matches[1]
		);

		return 'srcset="' . $set . '"';
	}

	/**
	 * Callback for a single srcset URL.
	 *
	 * @param array $matches Preg matches.
	 * @return string
	 */
	public function swap_srcset_url( $matches ) {
		$webp = $this->optimized_url( $matches[1] );
		if ( ! $webp ) {
			return $matches[0];
		}
		return $webp . ( isset( $matches[2] ) ? $matches[2] : '' );
	}

	/**
	 * Ensure attachment URLs point at the optimized file when it exists.
	 *
	 * @param string $url            Attachment URL.
	 * @param int    $attachment_id  Attachment ID.
	 * @return string
	 */
	public function filter_attachment_url( $url, $attachment_id ) {
		$webp = $this->optimized_url( $url );
		return $webp ?: $url;
	}

	/**
	 * Return the optimized (WebP/AVIF) URL for a given image URL, or false.
	 *
	 * @param string $url Original image URL.
	 * @return string|false
	 */
	private function optimized_url( $url ) {
		if ( ! is_string( $url ) || ! preg_match( '/\.(jpe?g|png|gif)$/i', $url ) ) {
			return false;
		}
		if ( ! $this->client_supports_webp() ) {
			return false;
		}

		$optimized = preg_replace( '/\.(jpe?g|png|gif)$/i', '.webp', $url );
		$path      = $this->url_to_path( $optimized );
		if ( $path && file_exists( $path ) ) {
			return $optimized;
		}

		$avif = preg_replace( '/\.(jpe?g|png|gif)$/i', '.avif', $url );
		$path = $this->url_to_path( $avif );
		if ( $path && file_exists( $path ) ) {
			return $avif;
		}

		return false;
	}

	/**
	 * Convert an attachment/static URL to an absolute file path.
	 *
	 * @param string $url URL.
	 * @return string|false
	 */
	private function url_to_path( $url ) {
		$home = wp_parse_url( home_url() );
		$u    = wp_parse_url( $url );

		if ( ! empty( $u['host'] ) && ! empty( $home['host'] ) && $u['host'] !== $home['host'] ) {
			return false; // external URL.
		}

		$path = $u['path'] ?? '';
		if ( '' === $path ) {
			return false;
		}

		return rtrim( ABSPATH, '/' ) . '/' . ltrim( $path, '/' );
	}

	/**
	 * Whether the current request accepts WebP.
	 *
	 * @return bool
	 */
	private function client_supports_webp() {
		return isset( $_SERVER['HTTP_ACCEPT'] ) && false !== strpos( (string) $_SERVER['HTTP_ACCEPT'], 'image/webp' );
	}

	/**
	 * Write Apache rewrite rules so static image requests are served the
	 * optimized variant when available. Idempotent (wrapped in markers).
	 *
	 * @return void
	 */
	public static function install_rewrites() {
		$htaccess = ABSPATH . '.htaccess';
		if ( ! function_exists( 'insert_with_markers' ) ) {
			require_once ABSPATH . 'wp-admin/includes/misc.php';
		}

		$rules = array(
			'<IfModule mod_rewrite.c>',
			'  RewriteEngine On',
			'  RewriteCond %{HTTP_ACCEPT} image/webp',
			'  RewriteCond %{DOCUMENT_ROOT}/$1.webp -f',
			'  RewriteRule ^(.+)\.(jpe?g|png|gif)$ $1.webp [T=image/webp,L]',
			'</IfModule>',
		);

		insert_with_markers( $htaccess, 'OptiPress', $rules );
	}
}
