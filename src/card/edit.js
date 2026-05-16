import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, Spinner } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { calcGridRow } from '../utils';

export default function Edit( { attributes, setAttributes, context } ) {
	const {
		postId,
		timeStart,
		timeEnd,
		sessionTitle,
		speakerName,
		sessionType,
		gridRowStart,
		gridRowEnd,
	} = attributes;

	const parentTimeStart    = context[ 'next-event-timetable/timeStart' ]    || '09:00';
	const parentTimeInterval = context[ 'next-event-timetable/timeInterval' ] || 60;

	const sessions = useSelect( ( select ) =>
		select( 'core' ).getEntityRecords( 'postType', 'next_event_session', {
			per_page: 100,
			_fields:  'id,title',
			status:   'publish',
		} ),
	[] );

	/* ポスト選択時にメタを取得して属性に反映 */
	useEffect( () => {
		if ( ! postId ) return;
		apiFetch( { path: `/wp/v2/next_event_session/${ postId }?_fields=id,title,meta` } )
			.then( ( post ) => {
				const speakers = JSON.parse( post.meta._session_speakers || '[]' );
				setAttributes( {
					sessionTitle: post.title.rendered || '',
					timeStart:    post.meta._session_start_time || '',
					timeEnd:      post.meta._session_end_time   || '',
					sessionType:  post.meta._session_type       || 'talk',
					speakerName:  speakers[ 0 ]?.name            || '',
				} );
			} );
	}, [ postId ] ); // eslint-disable-line react-hooks/exhaustive-deps

	/* 時間が変わったら grid-row を再計算して属性に保存 */
	useEffect( () => {
		if ( ! timeStart || ! timeEnd ) return;
		const { rowStart, rowEnd } = calcGridRow(
			timeStart, timeEnd, parentTimeStart, parentTimeInterval
		);
		if ( rowStart !== gridRowStart || rowEnd !== gridRowEnd ) {
			setAttributes( { gridRowStart: rowStart, gridRowEnd: rowEnd } );
		}
	}, [ timeStart, timeEnd, parentTimeStart, parentTimeInterval ] ); // eslint-disable-line react-hooks/exhaustive-deps

	const sessionOptions = [
		{ label: __( 'セッションを選択...', 'next-event-timetable' ), value: 0 },
		...( sessions || [] ).map( ( s ) => ( {
			label: s.title.rendered,
			value: s.id,
		} ) ),
	];

	const blockProps = useBlockProps( {
		className: `net-card net-card--${ sessionType }`,
		style:     { gridRow: `${ gridRowStart } / ${ gridRowEnd }` },
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'セッション設定', 'next-event-timetable' ) }>
					{ ! sessions ? (
						<Spinner />
					) : (
						<SelectControl
							label={ __( 'セッション', 'next-event-timetable' ) }
							value={ postId }
							options={ sessionOptions }
							onChange={ ( v ) => setAttributes( { postId: parseInt( v, 10 ) } ) }
						/>
					) }
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ postId ? (
					<>
						<span className="net-card__type">{ sessionType }</span>
						<p className="net-card__title">
							{ sessionTitle || __( '取得中...', 'next-event-timetable' ) }
						</p>
						{ speakerName && (
							<p className="net-card__speaker">{ speakerName }</p>
						) }
						{ timeStart && timeEnd && (
							<p className="net-card__time">{ timeStart } – { timeEnd }</p>
						) }
					</>
				) : (
					<p className="net-card__placeholder">
						{ __( 'サイドバーからセッションを選択', 'next-event-timetable' ) }
					</p>
				) }
			</div>
		</>
	);
}
