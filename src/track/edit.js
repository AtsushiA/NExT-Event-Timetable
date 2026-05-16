import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { ColorPicker } from '@wordpress/components';

const ALLOWED_BLOCKS = [ 'next-event-timetable/card' ];

export default function Edit( { attributes, setAttributes } ) {
	const { trackName, trackColor, capacity } = attributes;

	const blockProps = useBlockProps( {
		className: 'net-track',
		style: { '--net-track-color': trackColor },
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'トラック設定', 'next-event-timetable' ) }>
					<TextControl
						label={ __( 'トラック名', 'next-event-timetable' ) }
						value={ trackName }
						onChange={ ( v ) => setAttributes( { trackName: v } ) }
					/>
					<div style={ { marginBottom: '16px' } }>
						<p style={ { marginBottom: '4px', fontWeight: 600 } }>
							{ __( 'トラックカラー', 'next-event-timetable' ) }
						</p>
						<ColorPicker
							color={ trackColor }
							onChange={ ( v ) => setAttributes( { trackColor: v } ) }
							enableAlpha={ false }
						/>
					</div>
					<TextControl
						label={ __( '定員（0で非表示）', 'next-event-timetable' ) }
						type="number"
						value={ capacity }
						onChange={ ( v ) => setAttributes( { capacity: parseInt( v, 10 ) || 0 } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="net-track__header" style={ { borderTopColor: trackColor } }>
					<span className="net-track__name">
						{ trackName || __( 'トラック名を入力', 'next-event-timetable' ) }
					</span>
					{ capacity > 0 && (
						<span className="net-track__capacity">{ capacity }名</span>
					) }
				</div>
				<div className="net-track__cards">
					<InnerBlocks allowedBlocks={ ALLOWED_BLOCKS } />
				</div>
			</div>
		</>
	);
}
