<?php
/**
 * WooCommerce integration.
 *
 * WooCommerce product images are ordinary WordPress attachments, so they are
 * already covered by the general upload watcher. This class adds product-aware
 * behavior: detection, scope helpers, and ensures product-image filtering works
 * in scans. It must never break WooCommerce attachment relationships.
 *
 * @package OptiPress\WooCommerce
 */

namespace OptiPress\WooCommerce;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WooCommerce-aware hooks and helpers.
 */
class WooCommerceIntegration {

	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function register() {
		if ( ! optipress_is_woocommerce_active() ) {
			return;
		}

		// When a product's gallery/featured image changes, ensure it is queued.
		add_action( 'woocommerce_process_product_meta', array( $this, 'sync_product_images' ), 20, 1 );
		add_action( 'woocommerce_update_product', array( $this, 'sync_product_images' ), 20, 1 );
	}

	/**
	 * Queue featured + gallery images for a product when automation is on.
	 *
	 * @param int $product_id Product ID.
	 * @return void
	 */
	public function sync_product_images( $product_id ) {
		$mode = (string) optipress_get_option( 'automation_mode', 'automatic' );
		if ( 'manual' === $mode ) {
			return;
		}
		if ( ! (bool) optipress_get_option( 'wc_product_images', true ) ) {
			return;
		}

		$ids = array();
		$thumb = (int) get_post_thumbnail_id( $product_id );
		if ( $thumb ) {
			$ids[] = $thumb;
		}
		$gallery = get_post_meta( $product_id, '_product_image_gallery', true );
		if ( $gallery ) {
			foreach ( explode( ',', $gallery ) as $gid ) {
				$gid = (int) $gid;
				if ( $gid ) {
					$ids[] = $gid;
				}
			}
		}

		$queue = new \OptiPress\Queue\QueueManager();
		$target = (string) optipress_get_option( 'convert_to', 'webp' );
		foreach ( array_unique( $ids ) as $id ) {
			$path = get_attached_file( $id );
			// Gate on real image mime: galleries can contain PDFs/videos, and
			// enqueueing those would either fail repeatedly or (with
			// ImageMagick+Ghostscript) rasterize a document page.
			if ( $path && wp_get_image_mime( $path ) ) {
				$queue->enqueue( $id, $path, $target );
			}
		}
	}
}
