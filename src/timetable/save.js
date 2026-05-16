import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { toMinutes, toTimeLabel, getRowCount } from '../utils';

export default function save( { attributes } ) {
	const { timeStart, timeEnd, timeInterval } = attributes;

	const rowCount   = getRowCount( timeStart, timeEnd, timeInterval );
	const startMin   = toMinutes( timeStart );
	const timeLabels = Array.from( { length: rowCount }, ( _, i ) =>
		toTimeLabel( startMin + i * timeInterval )
	);

	const blockProps = useBlockProps.save( {
		className: 'net-timetable',
		style: {
			'--net-row-count':  rowCount,
			'--net-row-height': '60px',
		},
	} );

	return (
		<div { ...blockProps }>
			<div className="net-timetable__axis">
				{ timeLabels.map( ( label ) => (
					<div key={ label } className="net-timetable__time-label">{ label }</div>
				) ) }
			</div>
			<div className="net-timetable__tracks">
				<InnerBlocks.Content />
			</div>
		</div>
	);
}
