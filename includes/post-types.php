<?php
add_action( 'init', 'net_register_post_type' );
function net_register_post_type(): void {
	register_post_type(
		'next_event_session',
		[
			'labels'       => [
				'name'          => 'イベントセッション',
				'singular_name' => 'イベントセッション',
				'add_new_item'  => '新規セッションを追加',
				'edit_item'     => 'セッションを編集',
				'search_items'  => 'セッションを検索',
			],
			'public'       => true,
			'show_in_rest' => true,
			'supports'     => [ 'title', 'editor', 'thumbnail' ],
			'menu_icon'    => 'dashicons-calendar-alt',
			'rewrite'      => [ 'slug' => 'session' ],
		]
	);
}
