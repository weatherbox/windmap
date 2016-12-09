import React from 'react'
import { render } from 'react-dom'

import LevelDropdown from './src/LevelDropdown'
import ElementDropdown from './src/ElementDropdown'
import TimeSlider from './src/TimeSlider'

const style = {
	position: 'absolute',
	bottom: 0,
	left: 0,
	zIndex: 20,
	display: 'inline-block',
	padding: 10,
}

class WindmapUI extends React.Component {
	render() {
		return (
			<div style={style}>
				<LevelDropdown />
				<ElementDropdown />
				<TimeSlider />
			</div>
		)
	}
}


render(
	<WindmapUI />,
	document.getElementById('app')
)

