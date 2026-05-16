<?php
add_action( 'init', 'net_register_meta_fields' );
function net_register_meta_fields(): void {
	foreach ( [ '_session_start_time', '_session_end_time', '_session_type', '_session_speakers' ] as $key ) {
		register_post_meta(
			'next_event_session',
			$key,
			[
				'type'          => 'string',
				'single'        => true,
				'show_in_rest'  => true,
				'auth_callback' => fn() => current_user_can( 'edit_posts' ),
			]
		);
	}
}

add_action( 'admin_enqueue_scripts', 'net_enqueue_media_on_session_edit' );
function net_enqueue_media_on_session_edit( string $hook ): void {
	if ( ! in_array( $hook, [ 'post.php', 'post-new.php' ], true ) ) {
		return;
	}
	$screen = get_current_screen();
	if ( 'next_event_session' !== ( $screen->post_type ?? '' ) ) {
		return;
	}
	wp_enqueue_media();
}

add_action( 'add_meta_boxes', 'net_add_session_meta_box' );
function net_add_session_meta_box(): void {
	add_meta_box(
		'net_session_details',
		'セッション詳細',
		'net_render_session_meta_box',
		'next_event_session',
		'normal',
		'high'
	);
}

function net_render_session_meta_box( WP_Post $post ): void {
	wp_nonce_field( 'net_session_meta', 'net_session_nonce' );

	$start    = get_post_meta( $post->ID, '_session_start_time', true );
	$end      = get_post_meta( $post->ID, '_session_end_time', true );
	$type     = get_post_meta( $post->ID, '_session_type', true ) ?: 'talk';
	$speakers = json_decode( get_post_meta( $post->ID, '_session_speakers', true ) ?: '[]', true );
	?>
	<style>
		.net-mb-row { margin-bottom: 14px; }
		.net-mb-row label { display: block; font-weight: 600; margin-bottom: 4px; }
		.net-mb-row input, .net-mb-row select { width: 100%; max-width: 320px; }
		.net-speaker { border: 1px solid #ddd; padding: 10px 12px; margin-bottom: 8px; background: #f9f9f9; border-radius: 4px; position: relative; }
		.net-speaker__remove { position: absolute; top: 8px; right: 10px; color: #c00; cursor: pointer; background: none; border: none; font-size: 13px; }
		.net-speaker p { margin: 6px 0 0; }
		.net-speaker label { font-weight: normal; font-size: 12px; display: block; margin-bottom: 2px; }
		.net-speaker input { width: 100%; max-width: 280px; }
		.net-media-row { display: flex; align-items: center; gap: 8px; }
		.net-media-preview { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; display: none; }
	</style>

	<div class="net-mb-row">
		<label>開始時刻</label>
		<input type="time" name="net_start_time" value="<?php echo esc_attr( $start ); ?>">
	</div>
	<div class="net-mb-row">
		<label>終了時刻</label>
		<input type="time" name="net_end_time" value="<?php echo esc_attr( $end ); ?>">
	</div>
	<div class="net-mb-row">
		<label>セッション種別</label>
		<select name="net_session_type">
			<?php foreach ( [ 'talk', 'workshop', 'keynote', 'break' ] as $t ) : ?>
				<option value="<?php echo esc_attr( $t ); ?>" <?php selected( $type, $t ); ?>><?php echo esc_html( $t ); ?></option>
			<?php endforeach; ?>
		</select>
	</div>

	<div class="net-mb-row">
		<label>登壇者</label>
		<div id="net-speakers">
			<?php foreach ( $speakers as $i => $spk ) : ?>
				<?php net_speaker_row_html( $i, $spk ); ?>
			<?php endforeach; ?>
		</div>
		<button type="button" id="net-add-speaker" class="button button-secondary" style="margin-top:6px;">+ 登壇者を追加</button>
	</div>

	<script>
	(function () {
		let idx = <?php echo count( $speakers ); ?>;

		document.getElementById('net-add-speaker').addEventListener('click', function () {
			const wrap = document.getElementById('net-speakers');
			wrap.insertAdjacentHTML('beforeend', speakerTemplate(idx));
			bindRow(wrap.lastElementChild);
			idx++;
		});

		document.querySelectorAll('.net-speaker').forEach(bindRow);

		function bindRow(row) {
			row.querySelector('.net-speaker__remove').addEventListener('click', () => row.remove());

			row.querySelectorAll('.net-media-btn').forEach(function (btn) {
				btn.addEventListener('click', function () {
					const target = btn.dataset.target;
					const preview = btn.previousElementSibling;
					const frame = wp.media({ title: '画像を選択', button: { text: '選択' }, multiple: false });
					frame.on('select', function () {
						const att = frame.state().get('selection').first().toJSON();
						row.querySelector('[name="' + target + '"]').value = att.id;
						preview.src = att.sizes?.thumbnail?.url || att.url;
						preview.style.display = 'block';
					});
					frame.open();
				});
			});
		}

		function speakerTemplate(i) {
			return `<div class="net-speaker">
				<button type="button" class="net-speaker__remove">削除</button>
				<p><label>名前</label><input type="text" name="net_speakers[${i}][name]" value=""></p>
				<p><label>所属/会社名</label><input type="text" name="net_speakers[${i}][company]" value=""></p>
				<p><label>プロフィール写真</label>
					<span class="net-media-row">
						<img class="net-media-preview" src="">
						<button type="button" class="button net-media-btn" data-target="net_speakers[${i}][photo]">選択</button>
						<input type="hidden" name="net_speakers[${i}][photo]" value="">
					</span>
				</p>
				<p><label>会社ロゴ</label>
					<span class="net-media-row">
						<img class="net-media-preview" src="">
						<button type="button" class="button net-media-btn" data-target="net_speakers[${i}][company_logo]">選択</button>
						<input type="hidden" name="net_speakers[${i}][company_logo]" value="">
					</span>
				</p>
			</div>`;
		}
	})();
	</script>
	<?php
}

function net_speaker_row_html( int $i, array $spk ): void {
	$photo_src = $spk['photo'] ? wp_get_attachment_image_url( $spk['photo'], 'thumbnail' ) : '';
	$logo_src  = $spk['company_logo'] ? wp_get_attachment_image_url( $spk['company_logo'], 'thumbnail' ) : '';
	?>
	<div class="net-speaker">
		<button type="button" class="net-speaker__remove">削除</button>
		<p><label>名前</label>
			<input type="text" name="net_speakers[<?php echo $i; ?>][name]" value="<?php echo esc_attr( $spk['name'] ?? '' ); ?>">
		</p>
		<p><label>所属/会社名</label>
			<input type="text" name="net_speakers[<?php echo $i; ?>][company]" value="<?php echo esc_attr( $spk['company'] ?? '' ); ?>">
		</p>
		<p><label>プロフィール写真</label>
			<span class="net-media-row">
				<img class="net-media-preview" src="<?php echo esc_url( $photo_src ); ?>" <?php echo $photo_src ? 'style="display:block"' : ''; ?>>
				<button type="button" class="button net-media-btn" data-target="net_speakers[<?php echo $i; ?>][photo]">選択</button>
				<input type="hidden" name="net_speakers[<?php echo $i; ?>][photo]" value="<?php echo esc_attr( $spk['photo'] ?? '' ); ?>">
			</span>
		</p>
		<p><label>会社ロゴ</label>
			<span class="net-media-row">
				<img class="net-media-preview" src="<?php echo esc_url( $logo_src ); ?>" <?php echo $logo_src ? 'style="display:block"' : ''; ?>>
				<button type="button" class="button net-media-btn" data-target="net_speakers[<?php echo $i; ?>][company_logo]">選択</button>
				<input type="hidden" name="net_speakers[<?php echo $i; ?>][company_logo]" value="<?php echo esc_attr( $spk['company_logo'] ?? '' ); ?>">
			</span>
		</p>
	</div>
	<?php
}

add_action( 'save_post_next_event_session', 'net_save_session_meta' );
function net_save_session_meta( int $post_id ): void {
	if ( ! isset( $_POST['net_session_nonce'] ) || ! wp_verify_nonce( $_POST['net_session_nonce'], 'net_session_meta' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	update_post_meta( $post_id, '_session_start_time', sanitize_text_field( $_POST['net_start_time'] ?? '' ) );
	update_post_meta( $post_id, '_session_end_time', sanitize_text_field( $_POST['net_end_time'] ?? '' ) );
	update_post_meta( $post_id, '_session_type', sanitize_text_field( $_POST['net_session_type'] ?? 'talk' ) );

	$speakers = [];
	if ( ! empty( $_POST['net_speakers'] ) && is_array( $_POST['net_speakers'] ) ) {
		foreach ( $_POST['net_speakers'] as $spk ) {
			$speakers[] = [
				'name'         => sanitize_text_field( $spk['name'] ?? '' ),
				'company'      => sanitize_text_field( $spk['company'] ?? '' ),
				'photo'        => absint( $spk['photo'] ?? 0 ),
				'company_logo' => absint( $spk['company_logo'] ?? 0 ),
			];
		}
	}
	update_post_meta( $post_id, '_session_speakers', wp_json_encode( $speakers ) );
}
