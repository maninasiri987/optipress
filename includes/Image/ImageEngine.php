<?php
/**
 * Local image optimization engine.
 *
 * All processing happens on the customer's own hosting. Customer images are
 * NEVER uploaded to any external server. Uses Imagick when available, falling
 * back to GD.
 *
 * Key safety rule: if the optimized result is larger than the original, the
 * original is NOT replaced and the item is marked as skipped.
 *
 * @package OptiPress\Image
 */

namespace OptiPress\Image;

use OptiPress\Compatibility\SystemChecker;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Performs compression, resizing, format conversion and metadata stripping.
 */
class ImageEngine {

	/**
	 * System capability checker.
	 *
	 * @var SystemChecker
	 */
	private $checker;

	/**
	 * @param SystemChecker|null $checker Injected checker.
	 */
	public function __construct( $checker = null ) {
		$this->checker = $checker ?: new SystemChecker();
	}

	/**
	 * Optimization result structure.
	 *
	 * @param int    $attachment_id  Attachment ID.
	 * @param string $source_path    Absolute source path.
	 * @param array  $options        quality, max_width, max_height, target_format, strip_metadata.
	 * @return array {
	 *     success, skipped, replaced, output_path, original_size, new_size,
	 *     saved_bytes, ratio, reason, target_format
	 * }
	 */
	public function optimize( $attachment_id, $source_path, array $options ) {
		$default = array(
			'quality'        => 82,
			'max_width'      => 1920,
			'max_height'     => 1920,
			'target_format'  => 'original',
			'strip_metadata' => true,
		);
		$options = wp_parse_args( $options, $default );

		$result = array(
			'success'       => false,
			'skipped'       => false,
			'replaced'      => false,
			'output_path'   => $source_path,
			'original_size' => 0,
			'new_size'      => 0,
			'saved_bytes'   => 0,
			'ratio'         => 0,
			'reason'        => '',
			'target_format' => $options['target_format'],
		);

		if ( ! file_exists( $source_path ) || ! is_readable( $source_path ) ) {
			$result['reason'] = __( 'امکان خواندن تصویر وجود ندارد.', 'optipress' );
			return $result;
		}

		if ( ! wp_is_writable( dirname( $source_path ) ) ) {
			$result['reason'] = __( 'مجوز نوشتن روی پوشه تصویر وجود ندارد.', 'optipress' );
			return $result;
		}

		$original_size = filesize( $source_path );
		$result['original_size'] = $original_size;

		$target_mime = $this->resolve_target_mime( $options['target_format'], $source_path );
		if ( ! $target_mime ) {
			$result['reason'] = __( 'فرمت توسط سرور پشتیبانی نمی‌شود.', 'optipress' );
			return $result;
		}

		$temp_path = $this->temp_path( $source_path, $target_mime );

		$ok = $this->checker->imagick_available()
			? $this->process_imagick( $source_path, $temp_path, $options, $target_mime )
			: $this->process_gd( $source_path, $temp_path, $options, $target_mime );

		if ( ! $ok ) {
			@unlink( $temp_path ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
			$result['reason'] = $result['reason'] ?: __( 'خطا در پردازش تصویر.', 'optipress' );
			return $result;
		}

		$new_size = filesize( $temp_path );
		$result['new_size'] = $new_size;

		// PRINCIPLE: never replace with a larger file.
		if ( $new_size >= $original_size ) {
			@unlink( $temp_path ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
			$result['skipped'] = true;
			$result['reason']  = __( 'نیازی به بهینه‌سازی نداشت (نتیجه بزرگ‌تر از اصل بود).', 'optipress' );
			return $result;
		}

		// Commit the optimized file.
		$final_path = $source_path;
		if ( $temp_path !== $source_path ) {
			// Format conversion: replace original with new-extension file.
			$converted = $this->converted_path( $source_path, $target_mime );
			if ( ! @rename( $temp_path, $converted ) ) { // phpcs:ignore WordPress.PHP.NoSilencedErrors
				@unlink( $temp_path ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
				$result['reason'] = __( 'امکان ذخیره فایل بهینه‌شده وجود ندارد.', 'optipress' );
				return $result;
			}
			$final_path = $converted;
			$this->sync_attachment( $attachment_id, $source_path, $converted, $target_mime, $options );
		} else {
			// In-place same-format optimization.
			if ( ! @rename( $temp_path, $source_path ) ) { // phpcs:ignore WordPress.PHP.NoSilencedErrors
				@unlink( $temp_path ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
				$result['reason'] = __( 'امکان جایگزینی فایل اصلی وجود ندارد.', 'optipress' );
				return $result;
			}
		}

		$result['success']     = true;
		$result['replaced']    = true;
		$result['output_path'] = $final_path;
		$result['saved_bytes'] = $original_size - $new_size;
		$result['ratio']       = $original_size > 0 ? round( ( $result['saved_bytes'] / $original_size ) * 100, 2 ) : 0;

		return $result;
	}

	/**
	 * Resolve the target MIME type from the desired format.
	 *
	 * @param string $format      original|webp|avif.
	 * @param string $source_path Source path to infer original mime.
	 * @return string|null
	 */
	private function resolve_target_mime( $format, $source_path ) {
		$original_mime = wp_get_image_mime( $source_path );

		if ( 'webp' === $format ) {
			return $this->checker->supports_webp() ? 'image/webp' : $original_mime;
		}
		if ( 'avif' === $format ) {
			return $this->checker->supports_avif() ? 'image/avif' : $original_mime;
		}
		return $original_mime ?: null;
	}

	/**
	 * Build a temporary output path for processing.
	 *
	 * @param string $source_path Source path.
	 * @param string $target_mime Target mime.
	 * @return string
	 */
	private function temp_path( $source_path, $target_mime ) {
		$ext = $this->ext_for_mime( $target_mime );
		$dir = dirname( $source_path );
		return $dir . '/optipress-tmp-' . uniqid( '', true ) . '.' . $ext;
	}

	/**
	 * Build the final converted path (same base name, new extension).
	 *
	 * @param string $source_path Source path.
	 * @param string $target_mime Target mime.
	 * @return string
	 */
	private function converted_path( $source_path, $target_mime ) {
		$ext  = $this->ext_for_mime( $target_mime );
		$info = pathinfo( $source_path );
		return ( $info['dirname'] ?? dirname( $source_path ) ) . '/' . ( $info['filename'] ?? 'image' ) . '.' . $ext;
	}

	/**
	 * Map a mime type to a file extension.
	 *
	 * @param string $mime Mime type.
	 * @return string
	 */
	private function ext_for_mime( $mime ) {
		switch ( $mime ) {
			case 'image/webp':
				return 'webp';
			case 'image/avif':
				return 'avif';
			case 'image/png':
				return 'png';
			case 'image/gif':
				return 'gif';
			default:
				return 'jpg';
		}
	}

	/**
	 * Process an image with Imagick.
	 *
	 * @param string $source_path Source.
	 * @param string $temp_path   Temp output.
	 * @param array  $options     Options.
	 * @param string $target_mime Target mime.
	 * @return bool
	 */
	private function process_imagick( $source_path, $temp_path, $options, $target_mime ) {
		try {
			$image = new \Imagick( $source_path );

			if ( $options['strip_metadata'] ) {
				$image->stripImage();
			}

			$geo = $image->getImageGeometry();
			$new_w = $geo['width'];
			$new_h = $geo['height'];

			if ( $options['max_width'] > 0 && $new_w > $options['max_width'] ) {
				$new_w = $options['max_width'];
			}
			if ( $options['max_height'] > 0 && $new_h > $options['max_height'] ) {
				$new_h = $options['max_height'];
			}

			if ( $new_w !== $geo['width'] || $new_h !== $geo['height'] ) {
				$image->resizeImage( $new_w, $new_h, \Imagick::FILTER_LANCZOS, 1, false );
			}

			$image->setImageFormat( $this->ext_for_mime( $target_mime ) );
			$image->setImageCompressionQuality( (int) $options['quality'] );

			// Avoid keeping multiple frames for static images.
			if ( 'image/png' === $target_mime || 'image/webp' === $target_mime || 'image/avif' === $target_mime ) {
				$image->setImageAlphaChannel( \Imagick::ALPHACHANNEL_ACTIVATE );
			}

			if ( ! $image->writeImage( $temp_path ) ) {
				$image->clear();
				return false;
			}
			$image->clear();
			return true;
		} catch ( \Throwable $e ) {
			return false;
		}
	}

	/**
	 * Process an image with GD. GD has limited format support.
	 *
	 * @param string $source_path Source.
	 * @param string $temp_path   Temp output.
	 * @param array  $options     Options.
	 * @param string $target_mime Target mime.
	 * @return bool
	 */
	private function process_gd( $source_path, $temp_path, $options, $target_mime ) {
		if ( ! $this->checker->gd_available() ) {
			return false;
		}

		$original_mime = wp_get_image_mime( $source_path );
		switch ( $original_mime ) {
			case 'image/jpeg':
				$src = @imagecreatefromjpeg( $source_path ); // phpcs:ignore
				break;
			case 'image/png':
				$src = @imagecreatefrompng( $source_path ); // phpcs:ignore
				break;
			case 'image/webp':
				$src = @imagecreatefromwebp( $source_path ); // phpcs:ignore
				break;
			case 'image/avif':
				$src = @imagecreatefromavif( $source_path ); // phpcs:ignore
				break;
			case 'image/gif':
				$src = @imagecreatefromgif( $source_path ); // phpcs:ignore
				break;
			default:
				return false;
		}

		if ( empty( $src ) ) {
			return false;
		}

		$src_w = imagesx( $src );
		$src_h = imagesy( $src );
		$new_w = $src_w;
		$new_h = $src_h;

		if ( $options['max_width'] > 0 && $new_w > $options['max_width'] ) {
			$new_w = $options['max_width'];
		}
		if ( $options['max_height'] > 0 && $new_h > $options['max_height'] ) {
			$new_h = $options['max_height'];
		}

		// Preserve aspect ratio, never upscale.
		if ( $new_w < $src_w || $new_h < $src_h ) {
			$ratio = min( $new_w / $src_w, $new_h / $src_h );
			$dst_w = (int) round( $src_w * $ratio );
			$dst_h = (int) round( $src_h * $ratio );
			$dst   = imagecreatetruecolor( $dst_w, $dst_h );
			if ( $original_mime === 'image/png' || $original_mime === 'image/webp' ) {
				imagealphablending( $dst, false );
				imagesavealpha( $dst, true );
			}
			imagecopyresampled( $dst, $src, 0, 0, 0, 0, $dst_w, $dst_h, $src_w, $src_h );
		} else {
			$dst = $src;
		}

		$quality = (int) $options['quality'];
		$ok = false;

		switch ( $target_mime ) {
			case 'image/jpeg':
				$ok = @imagejpeg( $dst, $temp_path, $quality ); // phpcs:ignore
				break;
			case 'image/png':
				$ok = @imagepng( $dst, $temp_path, (int) round( ( 100 - $quality ) / 10 ) ); // phpcs:ignore
				break;
			case 'image/webp':
				$ok = @imagewebp( $dst, $temp_path, $quality ); // phpcs:ignore
				break;
			case 'image/avif':
				$ok = @imageavif( $dst, $temp_path, $quality ); // phpcs:ignore
				break;
			case 'image/gif':
				$ok = @imagegif( $dst, $temp_path ); // phpcs:ignore
				break;
		}

		if ( $dst !== $src ) {
			imagedestroy( $dst );
		}
		imagedestroy( $src );

		return (bool) $ok;
	}

	/**
	 * Keep WordPress attachment metadata consistent after a format change.
	 *
	 * Converts the main file AND every generated sub-size (thumbnail, medium,
	 * large, shop sizes, etc.) to the target format. Without this, the images
	 * actually rendered on the site stay unoptimized even though the full
	 * original was converted.
	 *
	 * @param int    $attachment_id Attachment ID.
	 * @param string $old_path      Original path.
	 * @param string $new_path      Converted path.
	 * @param string $target_mime   New mime.
	 * @param array  $options       Optimization options (quality, sizing, etc.).
	 * @return void
	 */
	private function sync_attachment( $attachment_id, $old_path, $new_path, $target_mime, $options = array() ) {
		if ( ! $attachment_id ) {
			return;
		}

		$relative = str_replace( wp_upload_dir()['basedir'] . '/', '', $new_path );
		update_post_meta( $attachment_id, '_wp_attached_file', $relative );

		wp_update_post(
			array(
				'ID'             => $attachment_id,
				'post_mime_type' => $target_mime,
			)
		);

		if ( ! function_exists( 'wp_generate_attachment_metadata' ) ) {
			return;
		}

		// Regenerate metadata (and sub-sizes) from the optimized main file.
		$meta = wp_generate_attachment_metadata( $attachment_id, $new_path );
		if ( empty( $meta ) || ! is_array( $meta ) ) {
			return;
		}

		// Point the main file record at the converted file.
		$meta['file'] = $relative;

		// Optimize every generated sub-size too.
		if ( ! empty( $meta['sizes'] ) && is_array( $meta['sizes'] ) ) {
			$uploads_base = wp_upload_dir()['basedir'];
			$dir          = dirname( $meta['file'] );
			foreach ( $meta['sizes'] as $size => $data ) {
				if ( empty( $data['file'] ) ) {
					continue;
				}
				$abs = wp_normalize_path( $uploads_base . '/' . $dir . '/' . $data['file'] );
				if ( ! file_exists( $abs ) ) {
					continue;
				}
				$size_mime = wp_get_image_mime( $abs );
				// Only convert raster formats into the (different) target format.
				if ( ! $size_mime || $size_mime === $target_mime || ! preg_match( '#^image/(jpeg|png|gif)$#', $size_mime ) ) {
					continue;
				}
				$converted = $this->converted_path( $abs, $target_mime );
				$ok        = $this->checker->imagick_available()
					? $this->process_imagick( $abs, $converted, $options, $target_mime )
					: $this->process_gd( $abs, $converted, $options, $target_mime );
				if ( $ok && file_exists( $converted ) ) {
					@unlink( $abs ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
					$meta['sizes'][ $size ]['file']      = basename( $converted );
					$meta['sizes'][ $size ]['mime-type'] = $target_mime;
				}
			}
		}

		wp_update_attachment_metadata( $attachment_id, $meta );
	}
}
