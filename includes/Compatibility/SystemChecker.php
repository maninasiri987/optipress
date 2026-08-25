<?php
/**
 * System compatibility checker.
 *
 * Evaluates the WordPress/PHP hosting environment and reports which OptiPress
 * capabilities are available. This drives the first-launch compatibility UI.
 *
 * @package OptiPress\Compatibility
 */

namespace OptiPress\Compatibility;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Detects environment capabilities.
 */
class SystemChecker {

	/**
	 * Run the full compatibility scan.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function check() {
		return array(
			'wordpress'   => $this->check_wordpress(),
			'php'         => $this->check_php(),
			'memory'      => $this->check_memory(),
			'max_exec'    => $this->check_max_execution(),
			'gd'          => $this->check_gd(),
			'imagick'     => $this->check_imagick(),
			'webp'        => $this->check_webp(),
			'avif'        => $this->check_avif(),
			'filesystem'  => $this->check_filesystem(),
			'upload_writable' => $this->check_upload_writable(),
		);
	}

	/**
	 * Overall status: true if environment is usable.
	 *
	 * Imagick is deliberately excluded: GD is a fully supported engine, so an
	 * Imagick-less host must not be reported as unusable.
	 *
	 * @return bool
	 */
	public function is_ok() {
		$checks = $this->check();
		foreach ( $checks as $key => $check ) {
			if ( 'imagick' === $key ) {
				continue;
			}
			if ( empty( $check['ok'] ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Best available image processor.
	 *
	 * @return string imagick|gd|none
	 */
	public function preferred_processor() {
		if ( $this->imagick_available() ) {
			return 'imagick';
		}
		if ( $this->gd_available() ) {
			return 'gd';
		}
		return 'none';
	}

	/**
	 * @return bool
	 */
	public function imagick_available() {
		return class_exists( 'Imagick' );
	}

	/**
	 * @return bool
	 */
	public function gd_available() {
		return extension_loaded( 'gd' );
	}

	/**
	 * @return array<string, mixed>
	 */
	private function check_wordpress() {
		global $wp_version;
		$ok  = version_compare( $wp_version, '6.0', '>=' );
		$msg = $ok ? '' : __( 'وردپرس باید حداقل نسخه ۶.۰ باشد.', 'optipress' );
		return array(
			'label'   => __( 'وردپرس', 'optipress' ),
			'ok'      => $ok,
			'value'   => $wp_version,
			'message' => $msg,
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private function check_php() {
		$ok  = version_compare( PHP_VERSION, '8.1', '>=' );
		$msg = $ok ? '' : __( 'نسخه PHP باید حداقل ۸.۱ باشد.', 'optipress' );
		return array(
			'label'   => __( 'PHP', 'optipress' ),
			'ok'      => $ok,
			'value'   => PHP_VERSION,
			'message' => $msg,
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private function check_memory() {
		$raw   = (string) ini_get( 'memory_limit' );
		// '' means no directive / unlimited, same as -1 — don't flag as "too low".
		$limit = ( '' === $raw || '-1' === $raw ) ? -1 : wp_convert_hr_to_bytes( $raw );
		$ok    = $limit >= 64 * 1024 * 1024 || -1 === $limit;
		$msg   = $ok ? '' : __( 'محدودیت حافظه کم است. حداقل ۶۴ مگابایت توصیه می‌شود.', 'optipress' );
		return array(
			'label'   => __( 'حافظه', 'optipress' ),
			'ok'      => $ok,
			'value'   => $raw,
			'message' => $msg,
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private function check_max_execution() {
		$limit = (int) ini_get( 'max_execution_time' );
		$ok    = 0 === $limit || $limit >= 30;
		$msg   = $ok ? '' : __( 'زمان اجرای مجاز کم است. OptiPress از پردازش دسته‌ای ایمن استفاده می‌کند.', 'optipress' );
		return array(
			'label'   => __( 'زمان اجرا', 'optipress' ),
			'ok'      => $ok,
			'value'   => ( 0 === $limit ? __( 'نامحدود', 'optipress' ) : $limit . 's' ),
			'message' => $msg,
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private function check_gd() {
		$ok = $this->gd_available();
		return array(
			'label'   => __( 'GD', 'optipress' ),
			'ok'      => $ok,
			'value'   => $ok ? __( 'در دسترس', 'optipress' ) : __( 'غیرفعال', 'optipress' ),
			'message' => $ok ? '' : __( 'کتابخانه GD در دسترس نیست. OptiPress از GD به‌عنوان جایگزین استفاده می‌کند.', 'optipress' ),
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private function check_imagick() {
		$ok = $this->imagick_available();
		return array(
			'label'   => __( 'Imagick', 'optipress' ),
			'ok'      => $ok,
			'value'   => $ok ? __( 'در دسترس', 'optipress' ) : __( 'غیرفعال', 'optipress' ),
			'message' => $ok ? '' : __( 'کتابخانه Imagick در دسترس نیست. جایگزین GD استفاده خواهد شد.', 'optipress' ),
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private function check_webp() {
		$ok = $this->supports_webp();
		return array(
			'label'   => __( 'WebP', 'optipress' ),
			'ok'      => $ok,
			'value'   => $ok ? __( 'پشتیبانی می‌شود', 'optipress' ) : __( 'پشتیبانی نمی‌شود', 'optipress' ),
			'message' => $ok ? '' : __( 'تبدیل به فرمت WebP توسط محیط پشتیبانی نمی‌شود.', 'optipress' ),
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private function check_avif() {
		$ok = $this->supports_avif();
		return array(
			'label'   => __( 'AVIF', 'optipress' ),
			'ok'      => $ok,
			'value'   => $ok ? __( 'پشتیبانی می‌شود', 'optipress' ) : __( 'پشتیبانی نمی‌شود', 'optipress' ),
			'message' => $ok ? '' : __( 'تبدیل به فرمت AVIF توسط محیط پشتیبانی نمی‌شود. از WebP استفاده کنید.', 'optipress' ),
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private function check_filesystem() {
		$upload = wp_upload_dir();
		$ok     = wp_is_writable( $upload['basedir'] );
		return array(
			'label'   => __( 'فایل‌سیستم', 'optipress' ),
			'ok'      => $ok,
			'value'   => $ok ? __( 'قابل نوشتن', 'optipress' ) : __( 'فقط خواندنی', 'optipress' ),
			'message' => $ok ? '' : __( 'پوشه آپلود قابل نوشتن نیست.', 'optipress' ),
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private function check_upload_writable() {
		$upload = wp_upload_dir();
		$test   = $upload['basedir'] . '/optipress-write-test.tmp';
		$ok     = (bool) file_put_contents( $test, 'ok' );
		if ( $ok ) {
			@unlink( $test );
		}
		return array(
			'label'   => __( 'دسترسی آپلود', 'optipress' ),
			'ok'      => $ok,
			'value'   => $ok ? __( 'مجاز', 'optipress' ) : __( 'غیرمجاز', 'optipress' ),
			'message' => $ok ? '' : __( 'نوشتن روی پوشه آپلود ممکن نیست.', 'optipress' ),
		);
	}

	/**
	 * Whether WebP encoding is supported by available processors.
	 *
	 * @return bool
	 */
	public function supports_webp() {
		if ( $this->imagick_available() ) {
			return count( \Imagick::queryFormats( 'WEBP' ) ) > 0;
		}
		if ( $this->gd_available() ) {
			return function_exists( 'imagewebp' );
		}
		return false;
	}

	/**
	 * Whether AVIF encoding is supported by available processors.
	 *
	 * @return bool
	 */
	public function supports_avif() {
		if ( $this->imagick_available() ) {
			return count( \Imagick::queryFormats( 'AVIF' ) ) > 0;
		}
		if ( $this->gd_available() ) {
			return function_exists( 'imageavif' );
		}
		return false;
	}
}
