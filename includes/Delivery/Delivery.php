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
 *  2. Hardcoded/static references inside post content, text widgets, etc.
 *     are wrapped in a <picture> element on output offering the optimized
 *     file as a <source>; the browser picks WebP when it supports it and
 *     falls back to the original image otherwise — no headers required.
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
	 * Each swappable <img> is wrapped in a <picture> element with an explicit
	 * WebP <source>. The BROWSER decides which variant to load based on its
	 * actual format support — no HTTP Accept-header sniffing involved — so
	 * delivery works identically behind any proxy/browser configuration,
	 * while non-WebP browsers keep using the original image as fallback.
	 *
	 * @param string $content Post content HTML.
	 * @return string
	 */
	public function rewrite_content_images( $content ) {
		if ( empty( $content ) ) {
			return $content;
		}

		if ( false === strpos( $content, 'src=' ) && false === strpos( $content, 'srcset=' ) ) {
			return $content;
		}

		// Protect any existing <picture> blocks so we never nest them.
		$stash = array();
		$content = preg_replace_callback(
			'/<picture\b.*?<\/picture>/is',
			static function ( $m ) use ( &$stash ) {
				$stash[] = $m[0];
				return '<!--optipress-picture-' . ( count( $stash ) - 1 ) . '-->';
			},
			$content
		);

		$content = preg_replace_callback( '/<img\b[^>]*>/i', array( $this, 'wrap_img_tag' ), $content );

		foreach ( $stash as $i => $html ) {
			$content = str_replace( '<!--optipress-picture-' . $i . '-->', $html, $content );
		}

		return $content;
	}

	/**
	 * Wrap an <img> tag in a <picture> element offering the optimized variant.
	 *
	 * @param array $matches Preg matches.
	 * @return string
	 */
	public function wrap_img_tag( $matches ) {
		$tag = $matches[0];

		$src     = '';
		$srcset  = '';
		$sizes   = '';
		// (?<![\w-]) prevents matching lazy-load attributes like data-src /
		// data-srcset (a plain \b matches between "-" and "s").
		if ( preg_match( '/(?<![\w-])src=["\']([^"\']+)["\']/i', $tag, $m ) ) {
			$src = $m[1];
		}
		if ( preg_match( '/(?<![\w-])srcset=["\']([^"\']+)["\']/i', $tag, $m ) ) {
			$srcset = $m[1];
		}
		if ( preg_match( '/(?<![\w-])sizes=["\']([^"\']+)["\']/i', $tag, $m ) ) {
			$sizes = $m[1];
		}

		// Collect the optimized candidates for this image.
		$candidates = array();

		// Preferred: rebuild the FULL responsive srcset from attachment
		// metadata (every sub-size whose optimized file exists).
		$meta_srcset = $this->metadata_srcset( $tag );
		if ( '' !== $meta_srcset ) {
			$candidates[] = $meta_srcset;
		}

		if ( '' !== $srcset ) {
			$webp_entries = array();
			foreach ( preg_split( '/\s*,\s/', trim( $srcset ) ) as $entry ) {
				if ( preg_match( '/^(\S+\.(?:jpe?g|png|gif))(\s+\d+[wx])?$/i', trim( $entry ), $em ) ) {
					$optimized = $this->optimized_url( $em[1] );
					if ( $optimized ) {
						$webp_entries[] = $optimized . ( isset( $em[2] ) ? $em[2] : '' );
					}
				}
			}
			if ( ! empty( $webp_entries ) ) {
				$candidates[] = implode( ', ', $webp_entries );
			}
		}

		if ( '' !== $src && empty( $candidates ) ) {
			$optimized = $this->optimized_url( $src );
			if ( $optimized ) {
				$candidates[] = $optimized;
			}
		}

		if ( empty( $candidates ) ) {
			return $tag; // No optimized variant exists; leave untouched.
		}

		$source = '<source type="image/webp" srcset="' . esc_attr( implode( ', ', $candidates ) ) . '"';
		if ( '' !== $sizes ) {
			$source .= ' sizes="' . esc_attr( $sizes ) . '"';
		}
		$source .= '>';

		return '<picture>' . $source . $tag . '</picture>';
	}

	/**
	 * Build a complete WebP srcset from the image's attachment metadata.
	 *
	 * Content images are recognized via the wp-image-{id} class. Returns ''
	 * when the tag is not identifiable or no optimized files exist.
	 *
	 * @param string $tag Original <img> tag.
	 * @return string
	 */
	private function metadata_srcset( $tag ) {
		if ( ! preg_match( '/wp-image-(\d+)/i', $tag, $m ) ) {
			return '';
		}

		$attachment_id = (int) $m[1];
		if ( $attachment_id <= 0 ) {
			return '';
		}

		$meta = wp_get_attachment_metadata( $attachment_id );
		if ( empty( $meta['file'] ) ) {
			return '';
		}

		$upload_dir = wp_upload_dir();
		$file_dir   = trailingslashit( dirname( $meta['file'] ) );

		$entries = array();

		// Every registered sub-size whose optimized file exists.
		if ( ! empty( $meta['sizes'] ) && is_array( $meta['sizes'] ) ) {
			foreach ( $meta['sizes'] as $data ) {
				if ( empty( $data['file'] ) || empty( $data['width'] ) ) {
					continue;
				}
				if ( ! preg_match( '/\.(webp|avif)$/i', $data['file'] ) ) {
					continue;
				}
				$url       = $upload_dir['baseurl'] . '/' . $file_dir . $data['file'];
				$entries[] = $url . ' ' . (int) $data['width'] . 'w';
			}
		}

		// The optimized full-size image itself.
		$main_file = basename( $meta['file'] );
		if ( preg_match( '/\.(webp|avif)$/i', $main_file ) && ! empty( $meta['width'] ) ) {
			$url       = $upload_dir['baseurl'] . '/' . $file_dir . $main_file;
			$entries[] = $url . ' ' . (int) $meta['width'] . 'w';
		}

		if ( empty( $entries ) ) {
			return '';
		}

		$entries = array_unique( $entries );

		// Sort smallest to largest for tidy markup.
		usort(
			$entries,
			static function ( $a, $b ) {
				preg_match( '/(\d+)w$/', $a, $am );
				preg_match( '/(\d+)w$/', $b, $bm );
				return ( (int) ( $am[1] ?? 0 ) ) - ( (int) ( $bm[1] ?? 0 ) );
			}
		);

		return implode( ', ', $entries );
	}

	/**
	 * Ensure attachment URLs point at the optimized file when it exists.
	 *
	 * Used in contexts where the browser cannot negotiate formats itself
	 * (e.g. og:image, embeds), so it stays gated on the client's Accept
	 * header as a conservative safety check.
	 *
	 * @param string $url            Attachment URL.
	 * @param int    $attachment_id  Attachment ID.
	 * @return string
	 */
	public function filter_attachment_url( $url, $attachment_id ) {
		if ( ! $this->client_supports_webp() ) {
			return $url;
		}
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
