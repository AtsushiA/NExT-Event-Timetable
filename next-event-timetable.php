<?php
/**
 * Plugin Name: NExT Event Timetable
 * Plugin URI:  https://github.com/AtsushiA/NExT-Event-Timetable
 * Description: Event timetable Gutenberg blocks with custom post type and taxonomies.
 * Version:     1.0.0
 * Author:      AtsushiA
 * Text Domain: next-event-timetable
 * Requires at least: 6.4
 * Requires PHP: 8.0
 *
 * @package NExT_Event_Timetable
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'NET_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'NET_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once NET_PLUGIN_DIR . 'includes/post-types.php';
require_once NET_PLUGIN_DIR . 'includes/taxonomies.php';
require_once NET_PLUGIN_DIR . 'includes/meta-fields.php';

add_action( 'init', 'net_register_blocks' );
/**
 * Register all three Gutenberg blocks from their build directories.
 */
function net_register_blocks(): void {
	foreach ( array( 'timetable', 'track', 'card' ) as $block ) {
		register_block_type( NET_PLUGIN_DIR . 'build/' . $block );
	}
}
