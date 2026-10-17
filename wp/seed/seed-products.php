<?php
/**
 * Seeds the 30 Cosmetics catalog products. Idempotent: existing products (matched by SKU) are updated,
 * never duplicated. Run via `wp eval-file` AFTER seed-structure.php (attribute taxonomies must be registered).
 */
if (!defined('ABSPATH')) exit;
require_once ABSPATH . 'wp-admin/includes/image.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
add_filter('intermediate_image_sizes_advanced', '__return_empty_array'); // storefront resizes via next/image

$seed = '/opt/cosmetics/seed';
$products = json_decode(file_get_contents("$seed/products.json"), true);

function cos_term($name, $tax, $slug, $order = null) {
    $t = get_term_by('slug', $slug, $tax);
    if (!$t) { $r = wp_insert_term($name, $tax, ['slug' => $slug]); if (is_wp_error($r)) { WP_CLI::warning($r->get_error_message()); return 0; } $id = $r['term_id']; }
    else { $id = $t->term_id; if ($t->name !== $name) wp_update_term($id, $tax, ['name' => $name]); }
    if ($order !== null) update_term_meta($id, 'order_' . $tax, $order);
    return $id;
}

function cos_attach($rel, $alt, $parent) {
    $path = "/opt/cosmetics/seed/media/$rel";
    if (!file_exists($path)) return 0;
    $hash = md5_file($path);
    $found = get_posts(['post_type' => 'attachment', 'post_status' => 'inherit', 'posts_per_page' => 1, 'meta_key' => '_cos_src', 'meta_value' => $rel]);
    if ($found) {
        $id = $found[0]->ID;
        if (get_post_meta($id, '_cos_hash', true) === $hash) { update_post_meta($id, '_wp_attachment_image_alt', $alt); return $id; }
        wp_delete_attachment($id, true);
    }
    $tmp = wp_tempnam($rel); copy($path, $tmp);
    $id = media_handle_sideload(['name' => str_replace('/', '-', preg_replace('#^products/#', '', $rel)), 'tmp_name' => $tmp], $parent, null);
    if (is_wp_error($id)) { WP_CLI::warning("$rel: " . $id->get_error_message()); @unlink($tmp); return 0; }
    update_post_meta($id, '_cos_src', $rel); update_post_meta($id, '_cos_hash', $hash);
    update_post_meta($id, '_wp_attachment_image_alt', $alt);
    return $id;
}

$created = 0; $updated = 0;
foreach ($products as $p) {
    $hasShades = count($p['shades']) > 0;
    $variable = $hasShades;

    $id = wc_get_product_id_by_sku($p['sku']);
    if ($id) {
        $product = wc_get_product($id);
        // product type may have changed between runs
        if (($variable && !$product->is_type('variable')) || (!$variable && $product->is_type('variable'))) {
            wp_delete_post($id, true); $id = 0; $product = $variable ? new WC_Product_Variable() : new WC_Product_Simple(); $created++;
        } else $updated++;
    } else { $product = $variable ? new WC_Product_Variable() : new WC_Product_Simple(); $created++; }

    $cat = get_term_by('slug', $p['cat'], 'product_cat');
    $catIds = [$cat->term_id];
    if ($cat->parent) $catIds[] = $cat->parent;
    $tagIds = array_map(fn($t) => cos_term($t, 'product_tag', $t === 'منتخب' ? 'featured' : 'tag-' . md5($t)), $p['tags']);

    $product->set_name($p['name']);
    $product->set_slug($p['slug']);
    $product->set_status('publish');
    $product->set_catalog_visibility('visible');
    $product->set_short_description($p['short']);
    $product->set_description($p['long']);
    $product->set_sku($p['sku']);
    $product->set_category_ids($catIds);
    $product->set_tag_ids($tagIds);
    $product->set_reviews_allowed(false);
    if (!$variable) {
        $product->set_regular_price((string) $p['price']);
        $product->set_sale_price($p['salePrice'] ? (string) $p['salePrice'] : '');
        $product->set_manage_stock(true);
        $product->set_stock_quantity(10 + (crc32($p['sku']) % 30));
        $product->set_stock_status('instock');
    }

    // Attributes
    $attrs = []; $pos = 0;
    if ($hasShades) {
        $termIds = [];
        foreach ($p['shades'] as $i => $c) $termIds[] = cos_term($c['name'], 'pa_shade', 'shade-' . $c['id'], $i);
        $a = new WC_Product_Attribute(); $a->set_id(wc_attribute_taxonomy_id_by_name('shade')); $a->set_name('pa_shade');
        $a->set_options($termIds); $a->set_position($pos++); $a->set_visible(true); $a->set_variation(true); $attrs[] = $a;
    }
    if (count($p['skin'])) {
        $termIds = [];
        $order = ['all' => 0, 'normal' => 1, 'dry' => 2, 'oily' => 3, 'combo' => 4, 'sens' => 5];
        foreach ($p['skin'] as $i => $k) $termIds[] = cos_term($p['skinNames'][$i], 'pa_skin', 'skin-' . $k, $order[$k] ?? 9);
        $a = new WC_Product_Attribute(); $a->set_id(wc_attribute_taxonomy_id_by_name('skin')); $a->set_name('pa_skin');
        $a->set_options($termIds); $a->set_position($pos++); $a->set_visible(true); $a->set_variation(false); $attrs[] = $a;
    }
    foreach ([['حجم', $p['volume']], ['بافت', $p['texture']]] as [$n, $v]) {
        $a = new WC_Product_Attribute(); $a->set_id(0); $a->set_name($n); $a->set_options([$v]);
        $a->set_position($pos++); $a->set_visible(true); $a->set_variation(false); $attrs[] = $a;
    }
    $product->set_attributes($attrs);
    if ($variable) { $product->set_regular_price((string) $p['price']); $product->set_sale_price($p['salePrice'] ? (string) $p['salePrice'] : ''); }

    $pid = $product->save();

    // Images
    $alt = $p['name'] . ' — تصویر محصول';
    $main = cos_attach("products/{$p['slug']}/main.webp", $alt, $pid);
    $gal = [];
    for ($g = 1; $g <= $p['gallery']; $g++) { $gid = cos_attach("products/{$p['slug']}/gallery-$g.webp", "$alt (نمای نزدیک $g)", $pid); if ($gid) $gal[] = $gid; }
    $product = wc_get_product($pid);
    if ($main) $product->set_image_id($main);
    $product->set_gallery_image_ids($gal);
    $product->save();

    // Meta used by the headless extension
    update_post_meta($pid, '_cos_seo_title', $p['seoTitle']);
    update_post_meta($pid, '_cos_seo_description', $p['seoDescription']);
    update_post_meta($pid, '_cos_volume', $p['volume']);
    update_post_meta($pid, '_cos_texture', $p['texture']);
    update_post_meta($pid, '_cos_featured', $p['featured'] ? 1 : 0);

    // Variations (one per shade)
    if ($variable) {
        $existing = [];
        foreach ($product->get_children() as $vid) { $v = wc_get_product($vid); if ($v) $existing[json_encode($v->get_attributes())] = $v; }
        foreach ($p['shades'] as $k => $c) {
            $va = ['pa_shade' => 'shade-' . $c['id']];
            $key = json_encode($va);
            $var = $existing[$key] ?? new WC_Product_Variation();
            $var->set_parent_id($pid);
            $var->set_attributes($va);
            $var->set_sku($p['sku'] . '-' . strtoupper(substr($c['id'], 0, 3)));
            $var->set_regular_price((string) $p['price']);
            $var->set_sale_price($p['salePrice'] ? (string) $p['salePrice'] : '');
            $var->set_manage_stock(true);
            $var->set_stock_quantity(6 + (crc32($p['sku'] . $key) % 20));
            $var->set_stock_status('instock');
            $var->save();
        }
        WC_Product_Variable::sync($pid);
    }
    WP_CLI::log(($id ? 'updated ' : 'created ') . $p['sku'] . ' ' . $p['slug']);
}
WP_CLI::success("products ok: created=$created updated=$updated");
