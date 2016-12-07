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
}

const timeToHideBottomBar = 10000
const time = {
	start: "201611301200",
	end: "201612011800",
	interval: "3h"
}

export default class TimeSlider extends React.Component {
	state = { visible: false }
	
	hide = () => {
		this.setState({ visible: false })
		window.map.off('preclick')
	}

	show = () => {
		this.setState({ visible: true })

		this._timer = setTimeout(this.hide, timeToHideBottomBar)
		window.map.on('preclick', this.hide)
	}

	scroll = (e) => {
		console.log(ReactDOM.findDOMNode(this.refs.slider).scrollLeft)

		if (this._timer) clearTimeout(this._timer)
		this._timer = setTimeout(this.hide, timeToHideBottomBar)
	}

	render() {
		return (
			<div>
				<div style={styles.button} onClick={this.show}>
					12/01 09:00
				</div>

				<Sidebar as='div' animation='overlay' direction='bottom' visible={this.state.visible}>
					<div style={styles.bottomBar}
						onScroll={this.scroll}
						ref='slider'>
						<TimeSliderHours start={time.start} end={time.end} />
					</div>

					<div style={styles.centerLine}></div>
				</Sidebar>

				<div className={'ui popup transition top center ' + ((this.state.visible) ? "visible" : "")} style={styles.popup}>
					12/01 09:00
				</div>
				
			</div>
		)
	}
}

class TimeSliderHours extends React.Component {

	constructor(props) {
		super(props)
		let { start, end } = props

		let startUTC = this.dateStringToDateUTC(start)
		let endUTC = this.dateStringToDateUTC(end)

		this.times = []
		this.hours = 0
		let timesDay = null
		for (var d = startUTC; d < endUTC; d += 3 * 3600 * 1000){
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

		console.log(this.times)
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

	render() {
		let halfWidth = window.innerWidth / 2
		styles.timeSlider.width = 24 * this.hours + this.times.length + halfWidth
		return (
			<div style={styles.timeSlider}>
				{this.times.map((day) => {
					console.log(day);
					if (day.hours.length > 1){
						return (
							<div className="time-slider-day"
								key={day.day}
								style={{ width: 24 * day.hours.length + 1 }}>
								{day.day} <br/>
								<span className="hours">
									{day.hours.map((hour) => {
										return <span key={hour}>{hour}</span>
									})}
								</span>
							</div>
						)

					}else if (day.hours[0] == '21'){
						return (
							<div className="time-slider-day"
								key={day.day}
								style={{ width:49, marginLeft:-24 }}>
								{day.day} <br/>
								<span className="hours">
									<span></span>
									<span>21</span>
								</span>
							</div>
						)

					}else if (day.hours[0] == '00'){
						return (
							<div className="time-slider-day"
								key={day.day}
								style={{ width:49, marginRight:-24 }}>
								{day.day} <br/>
								<span className="hours">
									<span>00</span>
									<span></span>
								</span>
							</div>
						)
					}
				})}
				<div style={{ width:halfWidth, display:'inline-block' }}></div>
			</div>
		)
	}
}



