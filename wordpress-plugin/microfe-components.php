<?php

/**
 * Plugin Name: MicroFE Components
 * Plugin URI: https://github.com/your-org/microfe-components
 * Description: Integrate React components from MicroFE into WordPress Gutenberg blocks
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL v2 or later
 * Text Domain: microfe-components
 */

if (!defined('ABSPATH')) {
    exit;
}

define('MICROFE_VERSION', '1.0.0');
define('MICROFE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('MICROFE_PLUGIN_URL', plugin_dir_url(__FILE__));

// Register block
function microfe_register_block()
{
    if (file_exists(MICROFE_PLUGIN_DIR . 'build/block.json')) {
        register_block_type(MICROFE_PLUGIN_DIR . 'build');
    } else {
        // Fallback: register block manually
        register_block_type('microfe/react-component', array(
            'render_callback' => 'microfe_render_block',
            'attributes' => array(
                'component' => array(
                    'type' => 'string',
                    'default' => '',
                ),
                'version' => array(
                    'type' => 'string',
                    'default' => '',
                ),
                'props' => array(
                    'type' => 'object',
                    'default' => array(),
                ),
            ),
        ));
    }
}
add_action('init', 'microfe_register_block');

// Enqueue block assets
function microfe_enqueue_block_assets()
{
    wp_enqueue_script(
        'microfe-block-editor',
        MICROFE_PLUGIN_URL . 'build/index.js',
        array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-api-fetch'),
        MICROFE_VERSION,
        true
    );

    wp_enqueue_style(
        'microfe-block-editor',
        MICROFE_PLUGIN_URL . 'build/index.css',
        array(),
        MICROFE_VERSION
    );

    // Get MicroFE API URL from settings
    $api_url = get_option('microfe_api_url', 'http://localhost:3000');

    // If running in Docker, try to detect and use host.docker.internal
    // This can be overridden in settings
    if (empty($api_url) || $api_url === 'http://localhost:3000') {
        // Check if we're in Docker (common indicators)
        if (file_exists('/.dockerenv') || getenv('DOCKER_CONTAINER')) {
            // Try host.docker.internal (works on Mac/Windows Docker Desktop)
            // On Linux, might need to use host machine IP or 172.17.0.1
            $api_url = 'http://host.docker.internal:3000';
        }
    }

    wp_localize_script('microfe-block-editor', 'microfeConfig', array(
        'apiUrl' => $api_url,
    ));
}
add_action('enqueue_block_editor_assets', 'microfe_enqueue_block_assets');

// Render block on frontend
function microfe_render_block($attributes)
{
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

    // Enqueue React if not already loaded
    if (!wp_script_is('react', 'enqueued')) {
        wp_enqueue_script('react', 'https://unpkg.com/react@18/umd/react.production.min.js', array(), '18.2.0', true);
    }
    if (!wp_script_is('react-dom', 'enqueued')) {
        wp_enqueue_script('react-dom', 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', array('react'), '18.2.0', true);
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

// Note: Block registration is handled in microfe_register_block()

// Add settings page
function microfe_add_settings_page()
{
    add_options_page(
        'MicroFE Settings',
        'MicroFE',
        'manage_options',
        'microfe-settings',
        'microfe_settings_page'
    );
}
add_action('admin_menu', 'microfe_add_settings_page');

function microfe_settings_page()
{
    if (isset($_POST['microfe_api_url'])) {
        update_option('microfe_api_url', sanitize_text_field($_POST['microfe_api_url']));
        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }
    $api_url = get_option('microfe_api_url', 'http://localhost:3000');
?>
    <div class="wrap">
        <h1>MicroFE Settings</h1>
        <form method="post" action="">
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="microfe_api_url">MicroFE API URL</label>
                    </th>
                    <td>
                        <input type="url" id="microfe_api_url" name="microfe_api_url" value="<?php echo esc_attr($api_url); ?>" class="regular-text" />
                        <p class="description">
                            The base URL of your MicroFE API.<br>
                            <strong>If WordPress is in Docker:</strong><br>
                            - Mac/Windows: Use <code>http://host.docker.internal:3000</code><br>
                            - Linux: Use your host machine's IP (e.g., <code>http://192.168.1.100:3000</code>) or <code>http://172.17.0.1:3000</code><br>
                            <strong>If WordPress is on host:</strong> Use <code>http://localhost:3000</code>
                        </p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
<?php
}
