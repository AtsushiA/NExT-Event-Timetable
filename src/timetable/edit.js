import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl } from '@wordpress/components';
import { toMinutes, toTimeLabel, getRowCount } from '../utils';

const ALLOWED_BLOCKS = [ 'next-event-timetable/track' ];
const TEMPLATE       = [ [ 'next-event-timetable/track' ] ];

export default function Edit( { attributes, setAttributes } ) {
	const { timeStart, timeEnd, timeInterval } = attributes;

	const rowCount  = getRowCount( timeStart, timeEnd, timeInterval );
	const startMin  = toMinutes( timeStart );
	const timeLabels = Array.from( { length: rowCount }, ( _, i ) =>
		toTimeLabel( startMin + i * timeInterval )
	);

	const blockProps = useBlockProps( {
		className: 'net-timetable',
		style: {
			'--net-row-count':  rowCount,
			'--net-row-height': '60px',
		},
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'タイムテーブル設定', 'next-event-timetable' ) }>
					<TextControl
						label={ __( '開始時刻', 'next-event-timetable' ) }
						type="time"
						value={ timeStart }
						onChange={ ( v ) => setAttributes( { timeStart: v } ) }
					/>
					<TextControl
						label={ __( '終了時刻', 'next-event-timetable' ) }
						type="time"
						value={ timeEnd }
						onChange={ ( v ) => setAttributes( { timeEnd: v } ) }
					/>
					<SelectControl
						label={ __( '時間の刻み', 'next-event-timetable' ) }
						value={ timeInterval }
						options={ [
							{ label: '15分', value: 15 },
							{ label: '30分', value: 30 },
							{ label: '60分', value: 60 },
						] }
						onChange={ ( v ) => setAttributes( { timeInterval: parseInt( v, 10 ) } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="net-timetable__axis">
					{ timeLabels.map( ( label ) => (
						<div key={ label } className="net-timetable__time-label">{ label }</div>
					) ) }
				</div>
				<div className="net-timetable__tracks">
					<InnerBlocks
						allowedBlocks={ ALLOWED_BLOCKS }
						template={ TEMPLATE }
					/>
				</div>
			</div>
		</>
	);
}
