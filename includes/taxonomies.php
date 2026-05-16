<?php
add_action( 'init', 'net_register_taxonomies' );
function net_register_taxonomies(): void {
	register_taxonomy(
		'next_event_track',
		'next_event_session',
		[
			'labels'       => [
				'name'          => 'セッショントラック',
				'singular_name' => 'トラック',
				'add_new_item'  => '新規トラックを追加',
			],
			'public'       => true,
			'show_in_rest' => true,
			'hierarchical' => false,
			'rewrite'      => [ 'slug' => 'event-track' ],
		]
	);

	register_taxonomy(
		'next_event_date',
		'next_event_session',
		[
			'labels'       => [
				'name'          => 'イベント日付',
				'singular_name' => '日付グループ',
				'add_new_item'  => '新規日付グループを追加',
			],
			'public'       => true,
			'show_in_rest' => true,
			'hierarchical' => false,
			'rewrite'      => [ 'slug' => 'event-date' ],
		]
	);
}
