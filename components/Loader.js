import React from 'react'

const style = {
	display: 'inline-block',
	marginLeft: 12,
}

export default class Loader extends React.Component {

	render () {
		return (
			<div style={style} className="loader-dot">
				<div className="dot"></div>
				<div className="dot"></div>
				<div className="dot"></div>
			</div>
		)
	}
}

