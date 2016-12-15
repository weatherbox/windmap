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
	state = {
		showTimeSlider: false,
		interval: '1h',
		level: 'surface',
	}

	constructor(props) {
		super(props)

		let self = this
		window.windmapUI = {
			setTimeSlider: function (start, end, now){
				self.setState({ showTimeSlider: true, start, end, now })
			},
			changeTimeSliderTime: function (now){
				self.setState({ now })
			},
			changeTimeSliderInterval: function (interval){
				self.setState({ interval })
			},
			setLevel: function (level){
				self.setState({ level })
			},
		}
	}

	render() {
		let state = this.state

		return (
			<div style={style}>
				<LevelDropdown level={state.level} />
				<ElementDropdown />
				{(() => {
					if (state.showTimeSlider){
						return (
							<TimeSlider 
								start={state.start}
								end={state.end}
								now={state.now}
								interval={state.interval}
							/>
						)
					}
				})()}
			</div>
		)
	}
}


render(
	<WindmapUI />,
	document.getElementById('app')
)

