import React from 'react'
import ReactDOM from 'react-dom'
import { Sidebar } from 'semantic-ui-react'

const styles = {
	button: {
		position: 'absolute',
		bottom: 10,
		left: 140,
		zIndex: 20,
		color: '#fff',
		fontSize: 16
	},
	bottomBar: {
		bottom: 0,
		left: 0,
		width: '100%',
		height: 50,
		zIndex: 221,
		transform: 'translate3d(0, 0, 0px)',
		color: '#fff',
		background: '#eee',
		overflowX: 'scroll',
		overflowY: 'hidden',
		WebkitOverflowScrolling: 'touch',
	},
	timeSlider: {
		marginLeft: '50%',
		height: 50,
	},
	centerLine: {
		position: 'absolute',
		width: 0,
		height: 50,
		bottom: 0,
		left: '50%',
		border: '1px solid #0095d9',
		marginLeft: -1,
		transform: 'translate3d(0, 0, 1px)',
		zIndex: 222
	},
	popup: {
		top: 'auto',
		bottom: 50,
		right: '50%',
		marginRight: -53,
	},
	timeSliderDay: {
		height: 50,
		display: 'inline-block',
		color: '#565656',
		textAlign: 'center',
		fontSize: 14,
		lineHeight: '25px',
		borderLeft: '1px solid #ccc',
		background: '#fff',
	},
	hoursSpan: {
		width: 24,
		display: 'inline-block',
		fontSize: 12,
		textAlign: 'center',
	}
}

const timeToHideBottomBar = 10000
const time = {
	start: "201611301200",
	end: "201612020300",
	interval: "3h"
}

export default class TimeSlider extends React.Component {
	state = {
		time: '01/01 00:00',
		visible: false
	}
	
	constructor(props) {
		super(props)
		this.startUTC = this.dateStringToDateUTC(time.start)
		this.endUTC = this.dateStringToDateUTC(time.end)

		this.state.time = this.dateToStr(this.startUTC)
	}
	
	hide = () => {
		this.setState({ visible: false })
		window.map.off('preclick')
	}

	show = () => {
		this.setState({ visible: true })

		this._timer = setTimeout(this.hide, timeToHideBottomBar)
		window.map.on('preclick', this.hide)
	}
	
	dateStringToDateUTC = (dateString) => {
		return Date.UTC(
			dateString.substr(0, 4),
			dateString.substr(4, 2) - 1,
			dateString.substr(6, 2),
			dateString.substr(8, 2),
			dateString.substr(10, 2)
		)
	}

	dateToStr = (d) => {
		let date = new Date(d)
		let day = (date.getMonth() + 1) + '/' + ('0' + date.getDate()).slice(-2)
		let hh = ('0' + date.getHours()).slice(-2)
		return day + ' ' + hh + ':00'
	}

	scroll = () => {
		if (this._timer) clearTimeout(this._timer)
		this._timer = setTimeout(this.hide, timeToHideBottomBar)
	}
	
	change = (date) => {
		this.setState({ time: this.dateToStr(date) })
	}

	render() {
		return (
			<div>
				<div style={styles.button} onClick={this.show}>
					{this.state.time}
				</div>

				<Sidebar as='div' animation='overlay' direction='bottom' visible={this.state.visible}>
					<TimeSliderHours
						start={this.startUTC}
						end={this.endUTC}
						onScroll={this.scroll}
						onChange={this.change} />

					<div style={styles.centerLine}></div>
				</Sidebar>

				<div className={'ui popup transition top center ' + ((this.state.visible) ? "visible" : "")} style={styles.popup}>
					{this.state.time}
				</div>
				
			</div>
		)
	}
}

class TimeSliderHours extends React.Component {

	constructor(props) {
		super(props)
		let { start, end, now } = props

		this.showDate = now
		this.times = []
		this.hours = 0
		let timesDay = null
		for (var d = start; d < end; d += 3 * 3600 * 1000){
			var date = new Date(d);
			var day = (date.getMonth() + 1) + '/' + ('0' + date.getDate()).slice(-2)
			var hh = ('0' + date.getHours()).slice(-2)
			this.hours++
			
			if (timesDay != day){
				timesDay = day
				this.times.push({
					day: day,
					hours: [hh]
				})
			}else{
				this.times[this.times.length - 1].hours.push(hh)
			}
		}
	}
	
	scroll = (e) => {
		this.props.onScroll()

		let scrollLeft = ReactDOM.findDOMNode(this.refs.slider).scrollLeft
		scrollLeft -= Math.floor((scrollLeft / 24 + 8 - this.times[0].hours.length ) / 8)
		let hour = Math.floor(scrollLeft / 8)

		let date = this.props.start + hour * 3600 * 1000
		if (date != this.showDate){
			this.showDate = date
			this.props.onChange(date)
		}
	}

	render() {
		let halfWidth = window.innerWidth / 2
		styles.timeSlider.width = 24 * this.hours + this.times.length + halfWidth
		return (
			<div style={styles.bottomBar}
				onScroll={this.scroll}
				ref='slider'>
				<div style={styles.timeSlider}>
					{this.times.map((day, i) => {
						if (day.hours.length > 1){
							let width = 24 * day.hours.length + 1
							let borderLeft = (i == 0) ? 'none' : '1px solid #ccc'

							return (
								<div key={day.day} style={Object.assign({}, styles.timeSliderDay, { width:width, borderLeft:borderLeft})}>
									{day.day} <br/>
									<span className="hours">
										{day.hours.map((hour) => {
											return <span key={hour} style={styles.hoursSpan}>{hour}</span>
										})}
									</span>
								</div>
							)

						}else if (day.hours[0] == '21'){
							return (
								<div key={day.day} style={Object.assign({}, styles.timeSliderDay, { width:49, marginLeft:-24, borderLeft:'none'})}>
									{day.day} <br/>
									<span className="hours">
										<span style={styles.hoursSpan}></span>
										<span style={styles.hoursSpan}>21</span>
									</span>
								</div>
							)

						}else if (day.hours[0] == '00'){
							styles.timeSliderDay.width = 49
							styles.timeSliderDay.marginRight = -24
							styles.timeSliderDay.borderLeft = (i == 0) ? 'none' : '1px solid #ccc'

							return (
								<div key={day.day} style={Object.assign({}, styles.timeSliderDay, { width:49, marginRight:-24 })}>
									{day.day} <br/>
									<span className="hours">
										<span style={styles.hoursSpan}>00</span>
										<span style={styles.hoursSpan}></span>
									</span>
								</div>
							)
						}
					})}
					<div style={{
						width: halfWidth,
						display: 'inline-block'
					}}></div>
				</div>
			</div>
		)
	}
}



