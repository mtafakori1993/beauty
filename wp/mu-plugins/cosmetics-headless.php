<?php
/**
 * Plugin Name: Cosmetics headless
 * Description: Headless-storefront glue: health endpoint, Store API extension data (SEO/volume/texture), hardening.
 */
defined('ABSPATH') || exit;

// ---- Never canonicalize-redirect: the storefront reaches WP through an internal hostname.
add_action('init', function () {
    remove_filter('template_redirect', 'redirect_canonical');
});

// ---- Behind the TLS-terminating proxy.
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['HTTPS'] = 'on';
}

// ---- Hardening
add_filter('xmlrpc_enabled', '__return_false');
add_filter('rest_endpoints', function ($endpoints) {
    if (!is_user_logged_in()) {
        unset($endpoints['/wp/v2/users'], $endpoints['/wp/v2/users/(?P<id>[\d]+)']);
    }
    return $endpoints;
});
add_action('wp_head', function () { echo '<meta name="robots" content="noindex,nofollow">' . "\n"; }, 1);
remove_action('wp_head', 'wp_generator');

// ---- Anything that is not admin/REST/login/cron goes to the storefront.
add_action('template_redirect', function () {
    $front = getenv('COSMETICS_STOREFRONT_URL');
    if ($front && !is_admin() && !wp_doing_cron()) {
        wp_redirect(rtrim($front, '/') . '/', 302);
        exit;
    }
}, 1);

// ---- Health endpoint (DB + WooCommerce loaded)
add_action('rest_api_init', function () {
    register_rest_route('cosmetics/v1', '/health', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {
            global $wpdb;
            $db = (bool) $wpdb->get_var('SELECT 1');
            $woo = class_exists('WooCommerce');
            $status = ($db && $woo) ? 200 : 503;
            return new WP_REST_Response(['ok' => $db && $woo, 'db' => $db, 'woocommerce' => $woo], $status);
        },
    ]);
});

// ---- Store API extension: per-product SEO + spec fields.
add_action('woocommerce_blocks_loaded', function () {
    if (!function_exists('woocommerce_store_api_register_endpoint_data')) return;
    woocommerce_store_api_register_endpoint_data([
        'endpoint' => Automattic\WooCommerce\StoreApi\Schemas\V1\ProductSchema::IDENTIFIER,
        'namespace' => 'cosmetics',
        'data_callback' => function ($product) {
            $id = $product->get_id();
            return [
                'seo_title' => (string) get_post_meta($id, '_cos_seo_title', true),
                'seo_description' => (string) get_post_meta($id, '_cos_seo_description', true),
                'volume' => (string) get_post_meta($id, '_cos_volume', true),
                'texture' => (string) get_post_meta($id, '_cos_texture', true),
                'featured' => (bool) get_post_meta($id, '_cos_featured', true),
            ];
        },
        'schema_callback' => function () {
            return [
                'seo_title' => ['type' => 'string', 'readonly' => true],
                'seo_description' => ['type' => 'string', 'readonly' => true],
                'volume' => ['type' => 'string', 'readonly' => true],
                'texture' => ['type' => 'string', 'readonly' => true],
                'featured' => ['type' => 'boolean', 'readonly' => true],
            ];
        },
        'schema_type' => ARRAY_A,
    ]);
});

// ---- No online gateway is connected: orders wait for support to confirm stock and arrange payment.
add_filter('woocommerce_cod_process_payment_order_status', function () { return 'on-hold'; });
add_action('woocommerce_store_api_checkout_order_processed', function ($order) {
    $order->add_order_note('سفارش از فروشگاه ثبت شد؛ پرداخت انجام نشده و باید با مشتری هماهنگ شود.');
});

// ---- Images are resized by the storefront (next/image). Never generate or "repair" sub-sizes on read:
// without this WordPress rewrites attachment metadata on every Store API response.
add_filter('intermediate_image_sizes_advanced', '__return_empty_array');
add_filter('wp_get_missing_image_subsizes', '__return_empty_array');

// ---- When free shipping is available, offer only that rate (otherwise the flat rate stays the default selection).
add_filter('woocommerce_package_rates', function ($rates) {
    $free = [];
    foreach ($rates as $id => $rate) if ('free_shipping' === $rate->method_id) $free[$id] = $rate;
    return $free ?: $rates;
}, 100);
