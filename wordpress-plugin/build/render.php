<?php
/**
 * Server-side render callback for MicroFE React Component block
 *
 * @param array $attributes Block attributes.
 * @return string Rendered HTML.
 */
function microfe_render_block_callback($attributes) {
    $component = isset($attributes['component']) ? $attributes['component'] : '';
    $version = isset($attributes['version']) ? $attributes['version'] : '';
    $props = isset($attributes['props']) ? $attributes['props'] : array();

    if (empty($component) || empty($version)) {
        return '<p>MicroFE Component: Invalid configuration</p>';
    }

    $api_url = get_option('microfe_api_url', 'http://localhost:3000');
    $container_id = 'microfe-' . esc_attr($component) . '-' . esc_attr($version) . '-' . uniqid();

    // Fetch SSR HTML
    $props_json = json_encode($props);
    $render_url = $api_url . '/api/render/' . urlencode($component) . '/' . urlencode($version) . '?props=' . urlencode($props_json);

    $response = wp_remote_get($render_url, array(
        'timeout' => 5,
        'sslverify' => false,
    ));

    $html = '';
    if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
        $body = json_decode(wp_remote_retrieve_body($response), true);
        $html = isset($body['html']) ? $body['html'] : '';
    } else {
        $html = '<p>Error loading component</p>';
    }

    // Enqueue hydration script
    $client_url = $api_url . '/cdn/components/' . urlencode($component) . '/' . urlencode($version) . '/client.js';
    wp_enqueue_script(
        'microfe-' . $component . '-' . $version,
        $client_url,
        array('react', 'react-dom'),
        null,
        true
    );

    // Enqueue CSS if available
    $css_url = $api_url . '/cdn/components/' . urlencode($component) . '/' . urlencode($version) . '/style.css';
    wp_enqueue_style(
        'microfe-' . $component . '-' . $version . '-css',
        $css_url,
        array(),
        null
    );

    // Output container with SSR HTML and props
    $props_attr = esc_attr($props_json);
    return sprintf(
        '<div id="%s" data-props="%s">%s</div>',
        esc_attr($container_id),
        $props_attr,
        $html
    );
}

