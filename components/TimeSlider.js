import React from 'react'
import ReactDOM from 'react-dom'

import TimeSliderTouch from './TimeSliderTouch'

const styles = {
	button: {
		marginLeft: 12,
		zIndex: 20,
		color: '#fff',
		fontSize: 16
	},
}

const timeToHideBottomBar = 3000
const timeToUpdate = 500

export default class TimeSlider extends React.Component {
	state = {
		time: '01/01 00:00',
		visible: false
	}
	
	constructor(props) {
		super(props)
		this.start = props.start
		this.end = props.end
		this.now = props.now

		this.state.time = this.dateToStr(this.now)
	}
	
	hide = () => {
		this.setState({ visible: false })
		window.map.off('preclick')
	}

	show = () => {
		this.setState({ visible: true })

		if (this._timer) clearTimeout(this._timer)
		this._timer = setTimeout(this.hide, timeToHideBottomBar)
		window.map.on('preclick', this.hide)
	}

	dateToStr = (d) => {
		let date = new Date(d)
		let mm = ('0' + (date.getMonth() + 1)).slice(-2)
		let dd = ('0' + date.getDate()).slice(-2)
		let hh = ('0' + date.getHours()).slice(-2)
		return mm + '/' + dd + ' ' + hh + ':00'
	}

	scroll = () => {
		if (this._timer) clearTimeout(this._timer)
		this._timer = setTimeout(this.hide, timeToHideBottomBar)
	}
	
	change = (date) => {
		this.scroll()
		this.setState({ time: this.dateToStr(date) })

		if (this._updateTimer) clearTimeout(this._updateTimer)
		this._updateTimer = setTimeout(function (){
			window.windmap.setTime(date)
		}, timeToUpdate);
	}

	render() {
		if (this.props.now != this.now){
			this.now = this.props.now
			this.state.time = this.dateToStr(this.props.now)
		}


		let slider
						
		if (1){
				slider = (
					<TimeSliderTouch
						visible={this.state.visible}
						time={this.state.time}
						loading={this.props.loading}
						start={this.start}
						end={this.end}
						now={this.now}
						interval={this.props.interval}
						onScroll={this.scroll}
						onChange={this.change} />
				)
		}

		return (
			<div style={{ display:'inline-block' }}>
				<div style={styles.button} onClick={this.show}>
					{this.state.time}
				</div>

				{slider}
			</div>
		)
	}
}



