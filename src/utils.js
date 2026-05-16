export const toMinutes = ( time ) => {
	const [ h, m ] = time.split( ':' ).map( Number );
	return h * 60 + m;
};

export const toTimeLabel = ( minutes ) => {
	const h = Math.floor( minutes / 60 );
	const m = minutes % 60;
	return `${ String( h ).padStart( 2, '0' ) }:${ String( m ).padStart( 2, '0' ) }`;
};

export const getRowCount = ( timeStart, timeEnd, timeInterval ) =>
	( toMinutes( timeEnd ) - toMinutes( timeStart ) ) / timeInterval;

export const calcGridRow = ( cardStart, cardEnd, parentStart, interval ) => {
	const rowStart = Math.round( ( toMinutes( cardStart ) - toMinutes( parentStart ) ) / interval ) + 1;
	const rowEnd   = Math.round( ( toMinutes( cardEnd )   - toMinutes( parentStart ) ) / interval ) + 1;
	return { rowStart, rowEnd };
};
