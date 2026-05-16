import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { trackName, trackColor, capacity } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'net-track',
		style: { '--net-track-color': trackColor },
	} );

	return (
		<div { ...blockProps }>
			<div className="net-track__header" style={ { borderTopColor: trackColor } }>
				<span className="net-track__name">{ trackName }</span>
				{ capacity > 0 && (
					<span className="net-track__capacity">{ capacity }名</span>
				) }
			</div>
			<div className="net-track__cards">
				<InnerBlocks.Content />
			</div>
		</div>
	);
}
