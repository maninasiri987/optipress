<?php
/**
 * Media Library scanner.
 *
 * Walks WordPress attachments, decides which need optimization, and enqueues
 * them as queue items (deduplicated by attachment + target format).
 *
 * @package OptiPress\Scanner
 */

namespace OptiPress\Scanner;

use OptiPress\Queue\QueueManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Scans attachments and populates the optimization queue.
 */
class Scanner {

	/**
	 * Run a scan and enqueue matching attachments.
	 *
	 * @param array $args {
	 *     scope: all|unoptimized|above_size|formats|product_images
	 *     min_size_mb: minimum size in MB (for above_size)
	 *     formats: array of mime prefixes to include (e.g. ['image/jpeg'])
	 *     limit: max attachments to evaluate (0 = no limit)
	 * }
	 * @return array { scanned, enqueued, skipped }
	 */
	public function scan( array $args = array() ) {
		$args = wp_parse_args(
			$args,
			array(
				'scope'       => 'all',
				'min_size_mb' => 0,
				'formats'     => array(),
				'limit'       => 0,
			)
		);

		$attachment_ids = $this->collect_attachment_ids( $args );
		$target_format  = (string) optipress_get_option( 'convert_to', 'webp' );

		$scanned  = 0;
		$enqueued = 0;
		$skipped  = 0;
		$already  = 0;

		$queue   = new QueueManager();
		// Prefetch existing queue rows once — avoids two queries per attachment
		// (N+1) on large libraries.
		$status_map = $queue->get_status_map( $attachment_ids );

		foreach ( $attachment_ids as $attachment_id ) {
			$scanned++;

			$path = $this->attachment_path( $attachment_id );
			if ( ! $path ) {
				continue;
			}

			if ( ! $this->is_optimizable( $path ) ) {
				$skipped++;
				continue;
			}

			// "Above size" scope: only images larger than the threshold.
			if ( 'above_size' === $args['scope'] && $args['min_size_mb'] > 0 ) {
				$bytes = @filesize( $path ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
				if ( false === $bytes || $bytes < (int) round( $args['min_size_mb'] * MB_IN_BYTES ) ) {
					$skipped++;
					continue;
				}
			}

			// Already in the queue (pending/processing/completed) — not an error,
			// just don't double-add it.
			if ( isset( $status_map[ (int) $attachment_id ] ) ) {
				$already++;
				continue;
			}

			$enqueued_id = $queue->enqueue(
				$attachment_id,
				$path,
				$target_format
			);

			if ( $enqueued_id ) {
				$enqueued++;
			} else {
				$skipped++;
			}
		}

		optipress_log( 'info', __( 'اسکن کتابخانه انجام شد.', 'optipress' ), array(
			'scanned'  => $scanned,
			'enqueued' => $enqueued,
		) );

		return array(
			'scanned'  => $scanned,
			'enqueued' => $enqueued,
			'skipped'  => $skipped,
			'already'  => $already,
		);
	}

	/**
	 * Collect attachment IDs for the requested scope.
	 *
	 * @param array $args Scan args.
	 * @return array<int>
	 */
	private function collect_attachment_ids( $args ) {
		if ( 'product_images' === $args['scope'] ) {
			return $this->product_attachment_ids();
		}

		$query_args = array(
			'post_type'      => 'attachment',
			'post_status'    => 'inherit',
			'posts_per_page' => $args['limit'] > 0 ? (int) $args['limit'] : 500,
			'paged'          => 1,
			'fields'         => 'ids',
			'post_mime_type' => $this->mime_filter( $args ),
			'orderby'        => 'ID',
			'order'          => 'ASC',
		);

		// NOTE: the "unoptimized" scope intentionally does NOT filter by the
		// `_optipress_optimized` meta. Instead, `is_optimizable()` below skips
		// any already-WebP/AVIF file, so a non-WebP image is always treated as
		// "not optimized" and gets enqueued for conversion.

		// Page through the whole library instead of silently truncating at one
		// request's worth of posts.
		$all_ids = array();
		do {
			$query   = new \WP_Query( $query_args );
			$page_ids = $query->posts;
			if ( ! empty( $page_ids ) ) {
				$all_ids = array_merge( $all_ids, $page_ids );
			}
			++$query_args['paged'];
			$more = ( $args['limit'] > 0 )
				? count( $all_ids ) < (int) $args['limit'] && $query->max_num_pages >= $query_args['paged'] - 1
				: count( $page_ids ) > 0;
		} while ( $more );

		if ( $args['limit'] > 0 ) {
			$all_ids = array_slice( $all_ids, 0, (int) $args['limit'] );
		}

		return $all_ids;
	}

	/**
	 * Build a mime_type filter for WP_Query.
	 *
	 * @param array $args Scan args.
	 * @return string|array
	 */
	private function mime_filter( $args ) {
		if ( 'above_size' === $args['scope'] && $args['min_size_mb'] > 0 ) {
			// WP_Query cannot filter by file size; we evaluate size in loop.
			return array( 'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif' );
		}
		if ( ! empty( $args['formats'] ) ) {
			return $args['formats'];
		}
		return array( 'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif' );
	}

	/**
	 * Collect attachment IDs that belong to WooCommerce products.
	 *
	 * Pages through every product (no silent cap) and includes variation
	 * featured images, which live on product_variation posts.
	 *
	 * @return array<int>
	 */
	private function product_attachment_ids() {
		$ids = array();

		$paged = 1;
		do {
			$products = get_posts(
				array(
					'post_type'      => 'product',
					'post_status'    => 'any',
					'posts_per_page' => 500,
					'paged'          => $paged,
					'fields'         => 'ids',
				)
			);

			foreach ( $products as $product_id ) {
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
			}

			++$paged;
			$more = count( $products ) === 500;
		} while ( $more );

		// Variable-product variations store their image as the variation's
		// featured image.
		if ( post_type_exists( 'product_variation' ) ) {
			$paged = 1;
			do {
				$variations = get_posts(
					array(
						'post_type'      => 'product_variation',
						'post_status'    => 'any',
						'posts_per_page' => 500,
						'paged'          => $paged,
						'fields'         => 'ids',
						'meta_key'       => '_thumbnail_id', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
					)
				);

				foreach ( $variations as $variation_id ) {
					$thumb = (int) get_post_thumbnail_id( $variation_id );
					if ( $thumb ) {
						$ids[] = $thumb;
					}
				}

				++$paged;
				$more = count( $variations ) === 500;
			} while ( $more );
		}

		return array_values( array_unique( array_filter( $ids ) ) );
	}

	/**
	 * Resolve the absolute filesystem path for an attachment.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return string|null
	 */
	private function attachment_path( $attachment_id ) {
		$file = get_attached_file( $attachment_id );
		if ( ! $file ) {
			return null;
		}
		// Handle above_size filter.
		return $file;
	}

	/**
	 * Determine whether a file is a supported, optimizable image.
	 *
	 * @param string $path Path.
	 * @return bool
	 */
	private function is_optimizable( $path ) {
		if ( ! file_exists( $path ) || ! is_readable( $path ) ) {
			return false;
		}
		$mime = wp_get_image_mime( $path );
		if ( ! in_array( $mime, array( 'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif' ), true ) ) {
			return false;
		}
		// Already in a modern format (WebP/AVIF) is considered optimized.
		$ext = strtolower( pathinfo( $path, PATHINFO_EXTENSION ) );
		if ( in_array( $ext, array( 'webp', 'avif' ), true ) ) {
			return false;
		}
		return true;
	}
}
