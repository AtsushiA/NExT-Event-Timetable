import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		postId,
		timeStart,
		timeEnd,
		sessionTitle,
		speakerName,
		speakerAvatar,
		sessionType,
		gridRowStart,
		gridRowEnd,
	} = attributes;

	const blockProps = useBlockProps.save( {
		className:       `net-card net-card--${ sessionType }`,
		style:           { gridRow: `${ gridRowStart } / ${ gridRowEnd }` },
		'data-post-id':  postId,
	} );

	return (
		<div { ...blockProps }>
			<button className="net-card__inner" type="button">
				<span className="net-card__type">{ sessionType }</span>
				<p className="net-card__title">{ sessionTitle }</p>
				{ speakerName && (
					<div className="net-card__speaker">
						{ speakerAvatar && (
							<img
								src={ speakerAvatar }
								alt={ speakerName }
								className="net-card__avatar"
								width="20"
								height="20"
							/>
						) }
						<span>{ speakerName }</span>
					</div>
				) }
				{ timeStart && timeEnd && (
					<p className="net-card__time">{ timeStart } – { timeEnd }</p>
				) }
			</button>
		</div>
	);
}
