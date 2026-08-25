<?php
/**
 * Media Library integration: status column, filter, and bulk actions.
 *
 * Adds an "OptiPress" column to the WordPress media list, a dropdown filter
 * for optimized / unoptimized / failed images, and bulk actions to enqueue
 * images for optimization or restore their original backups.
 *
 * @package OptiPress\Media
 */

namespace OptiPress\Media;

use OptiPress\Queue\QueueManager;
use OptiPress\Backup\BackupManager;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Hooks the media library screens.
 */
class MediaLibrary {

    /**
     * Status map for the current media query (attachment_id => row).
     *
     * @var array<int, array<string, mixed>>
     */
    private $status_map = array();

    /**
     * Register hooks.
     *
     * @return void
     */
    public function register() {
        add_filter( 'manage_media_columns', array( $this, 'add_column' ) );
        add_action( 'manage_media_custom_column', array( $this, 'render_column' ), 10, 2 );
        add_action( 'loop_start', array( $this, 'prepare_status_map' ) );

        add_action( 'restrict_manage_posts', array( $this, 'render_filter' ), 10, 2 );
        add_filter( 'posts_clauses', array( $this, 'apply_filter' ), 10, 2 );

        add_filter( 'bulk_actions-upload', array( $this, 'bulk_actions' ) );
        add_filter( 'handle_bulk_actions-upload', array( $this, 'handle_bulk' ), 10, 3 );

        add_action( 'admin_notices', array( $this, 'render_notice' ) );
    }

    /**
     * Add the OptiPress column.
     *
     * @param array<string,string> $columns Media columns.
     * @return array<string,string>
     */
    public function add_column( $columns ) {
        $columns['optipress_status'] = __( 'OptiPress', 'optipress' );
        return $columns;
    }

    /**
     * Render the status cell.
     *
     * @param string $column_name Column key.
     * @param int    $post_id     Attachment ID.
     * @return void
     */
    public function render_column( $column_name, $post_id ) {
        if ( 'optipress_status' !== $column_name ) {
            return;
        }

        $row = $this->status_map[ (int) $post_id ] ?? null;
        if ( empty( $row ) ) {
            echo '<span style="color:#9ca3af;">—</span>';
            return;
        }

        $labels = array(
            'pending'    => array( 'در صف', '#2563eb' ),
            'processing' => array( 'در حال پردازش', '#d97706' ),
            'completed'  => array( 'بهینه‌شده', '#16a34a' ),
            'failed'     => array( 'ناموفق', '#e11d48' ),
            'skipped'    => array( 'رد شده', '#6b7280' ),
        );

        $meta  = $labels[ $row['status'] ] ?? $labels['skipped'];
        $saved = (int) ( $row['saved_bytes'] ?? 0 );
        $extra = '';
        if ( 'completed' === $row['status'] && $saved > 0 ) {
            $src = (int) ( $row['source_size'] ?? 0 );
            $pct = $src > 0 ? round( ( $saved / $src ) * 100 ) : 0;
            $extra = ' <span style="color:#16a34a;">−' . $pct . '٪</span>';
        }

        echo '<span style="color:' . esc_attr( $meta[1] ) . ';font-weight:600;">'
            . esc_html( $meta[0] ) . '</span>' . wp_kses_post( $extra );
    }

    /**
     * Build the status map for the attachments shown on the current page.
     *
     * @param \WP_Query $query Current query.
     * @return void
     */
    public function prepare_status_map( $query ) {
        if ( ! is_admin() || ! $query->is_main_query() ) {
            return;
        }
        $screen = get_current_screen();
        if ( ! $screen || 'upload' !== $screen->id ) {
            return;
        }

        $ids = array();
        foreach ( $query->posts as $post ) {
            $ids[] = (int) $post->ID;
        }
        $this->status_map = ( new QueueManager() )->get_status_map( $ids );
    }

    /**
     * Render the status dropdown filter.
     *
     * @param string $post_type Current post type.
     * @param string $which     Top/bottom placement.
     * @return void
     */
    public function render_filter( $post_type, $which = 'top' ) {
        if ( 'attachment' !== $post_type || 'top' !== $which ) {
            return;
        }
        $current = isset( $_GET['optipress_status'] ) ? sanitize_key( wp_unslash( $_GET['optipress_status'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        $options = array(
            ''            => __( 'همه تصاویر', 'optipress' ),
            'optimized'   => __( 'بهینه‌شده', 'optipress' ),
            'unoptimized' => __( 'بهینه‌نشده', 'optipress' ),
            'failed'      => __( 'ناموفق', 'optipress' ),
        );
        echo '<select name="optipress_status" id="optipress-status-filter" style="margin-right:6px;">';
        foreach ( $options as $value => $label ) {
            printf(
                '<option value="%s" %s>%s</option>',
                esc_attr( $value ),
                selected( $value, $current, false ),
                esc_html( $label )
            );
        }
        echo '</select>';
    }

    /**
     * Apply the status filter to the media query via JOIN + WHERE.
     *
     * @param array<string,string> $clauses Query clauses.
     * @param \WP_Query            $query    Current query.
     * @return array<string,string>
     */
    public function apply_filter( $clauses, $query ) {
        if ( ! is_admin() || ! $query->is_main_query() ) {
            return $clauses;
        }
        $screen = get_current_screen();
        if ( ! $screen || 'upload' !== $screen->id ) {
            return $clauses;
        }

        $filter = isset( $_GET['optipress_status'] ) ? sanitize_key( wp_unslash( $_GET['optipress_status'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( ! in_array( $filter, array( 'optimized', 'unoptimized', 'failed' ), true ) ) {
            return $clauses;
        }

        global $wpdb;
        $table = QueueManager::table();
        $clauses['join'] .= " LEFT JOIN {$table} oq ON oq.attachment_id = {$wpdb->posts}.ID";

        if ( 'optimized' === $filter ) {
            $clauses['where'] .= " AND oq.status = 'completed'";
        } elseif ( 'failed' === $filter ) {
            $clauses['where'] .= " AND oq.status = 'failed'";
        } else {
            $clauses['where'] .= " AND {$wpdb->posts}.post_mime_type LIKE 'image/%' AND (oq.status IS NULL OR oq.status != 'completed')";
        }

        return $clauses;
    }

    /**
     * Register bulk actions.
     *
     * @param array<string,string> $actions Existing actions.
     * @return array<string,string>
     */
    public function bulk_actions( $actions ) {
        $actions['optipress_optimize'] = __( 'بهینه‌سازی با OptiPress', 'optipress' );
        $actions['optipress_restore']  = __( 'بازیابی نسخه اصلی', 'optipress' );
        return $actions;
    }

    /**
     * Handle bulk actions.
     *
     * @param string $redirect Redirect URL.
     * @param string $action   Action key.
     * @param int[]  $post_ids Selected attachment IDs.
     * @return string
     */
    public function handle_bulk( $redirect, $action, $post_ids ) {
        if ( 'optipress_optimize' === $action ) {
            $queue = new QueueManager();
            $count = 0;
            foreach ( $post_ids as $id ) {
                $count += $queue->enqueue_attachment( (int) $id ) ? 1 : 0;
            }
            $redirect = add_query_arg( 'optipress_bulk', 'optimize:' . $count, $redirect );
        } elseif ( 'optipress_restore' === $action ) {
            $backup = new BackupManager();
            $count  = 0;
            foreach ( $post_ids as $id ) {
                $count += $backup->restore( (int) $id ) ? 1 : 0;
            }
            $redirect = add_query_arg( 'optipress_bulk', 'restore:' . $count, $redirect );
        }
        return $redirect;
    }

    /**
     * Render an admin notice after a bulk action.
     *
     * @return void
     */
    public function render_notice() {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( empty( $_GET['optipress_bulk'] ) ) {
            return;
        }
        $value   = sanitize_text_field( wp_unslash( $_GET['optipress_bulk'] ) ); // phpcs:ignore
        $parts   = explode( ':', $value, 2 );
        $type    = $parts[0] ?? '';
        $count   = isset( $parts[1] ) ? (int) $parts[1] : 0;

        if ( 'optimize' === $type ) {
            $msg = sprintf( __( '%d تصویر به صف بهینه‌سازی اضافه شد.', 'optipress' ), $count );
        } else {
            $msg = sprintf( __( 'نسخه اصلی %d تصویر بازیابی شد.', 'optipress' ), $count );
        }

        echo '<div class="notice notice-success is-dismissible"><p>' . esc_html( $msg ) . '</p></div>';
    }
}
