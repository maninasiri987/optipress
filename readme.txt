=== OptiPress ===
Contributors: optipress
Tags: image optimization, woocommerce, persian, rtl, compress images, webp, avif
Requires at least: 5.8
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 1.0.0
License: proprietary
Text Domain: optipress

== Description ==

**OptiPress** is a professional, fully localized Persian and right-to-left (RTL) plugin for optimizing WordPress and WooCommerce images. All processing runs **locally on your own hosting** — no image is ever sent to an external server.

Key features:

* Batch optimization with scheduling limits (safe for shared hosting)
* Automatic backup of every original file before replacement, with one-click restore
* Conversion to modern WebP / AVIF formats while preserving quality
* Full WooCommerce support (product featured images and galleries)
* "Optimized / Unoptimized / Failed" column and filters in the Media Library
* Optimization status and restore actions inside the media details modal
* Uses Imagick with automatic fallback to GD when unavailable
* No daemon or third-party service required — runs through WP-Cron

This is the full, paid version of OptiPress.

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/optipress`.
2. Activate the plugin from the "Plugins" screen.
3. Use the "OptiPress" menu to scan, schedule, and monitor optimization.

== Frequently Asked Questions ==

= Are my images sent to another server? =
No. All processing happens on your own hosting.

= Does it work on shared hosting? =
Yes. OptiPress uses small, resumable batches driven by WP-Cron.

= How do I restore the original version of an image? =
Use the restore button in the optimization queue, the Media Library, or the attachment details modal.

== Changelog ==

= 1.0.0 =
* Initial release of the paid OptiPress plugin.
