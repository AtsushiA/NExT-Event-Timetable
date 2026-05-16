document.querySelectorAll( '.net-card__inner' ).forEach( ( btn ) => {
	btn.addEventListener( 'click', () => {
		const postId = btn.closest( '.net-card' )?.dataset.postId;
		if ( ! postId ) return;
		openModal( `/?p=${ postId }&next_event_modal=1` );
	} );
} );

function openModal( url ) {
	const overlay = document.createElement( 'div' );
	overlay.className = 'net-modal-overlay';
	overlay.innerHTML = `
		<div class="net-modal" role="dialog" aria-modal="true">
			<button class="net-modal__close" type="button" aria-label="閉じる">&#x2715;</button>
			<iframe class="net-modal__iframe" src="${ url }" loading="lazy"></iframe>
		</div>
	`;

	document.body.appendChild( overlay );
	document.body.style.overflow = 'hidden';

	const close = () => {
		overlay.remove();
		document.body.style.overflow = '';
	};

	overlay.querySelector( '.net-modal__close' ).addEventListener( 'click', close );
	overlay.addEventListener( 'click', ( e ) => {
		if ( e.target === overlay ) close();
	} );
	document.addEventListener( 'keydown', function onKey( e ) {
		if ( e.key === 'Escape' ) {
			close();
			document.removeEventListener( 'keydown', onKey );
		}
	} );
}
