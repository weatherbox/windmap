import React from 'react'
import ReactDOM from 'react-dom'
import { Sidebar } from 'semantic-ui-react'

import Loader from './Loader'


const styles = {
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
		position: 'fixed',
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
	},
	loading: {
		position: 'fixed',
		display: 'block',
		bottom: 72,
		left: "50%",
		marginLeft: 53,
	}
}


export default class TimeSliderTouch extends React.Component {

	render() {
		let loading = this.props.loading
		let visible = this.props.visible

		return (
			<div>
				<Sidebar as='div' animation='overlay' direction='bottom' visible={this.props.visible}>
					<TimeSliderHours
						start={this.props.start}
						end={this.props.end}
						now={this.props.now}
						interval={this.props.interval}
						onScroll={this.props.onScroll}
						onChange={this.props.onChange} />

					<div style={styles.centerLine}></div>
				</Sidebar>

				<div className={'ui popup transition top center ' + ((this.props.visible) ? "visible" : "")} style={styles.popup}>
					{this.props.time}
				</div>

				{(() => {
					if (loading && visible){
						return (
							<div style={styles.loading}>
								<Loader />
							</div>
						)
					}
				})()}
			</div>
		)
	}
}


class TimeSliderHours extends React.Component {

	constructor(props) {
		super(props)
		
		this.showDate = this.props.now
		this.changeInterval(this.props.interval)

		this.times = []
		this.hours = 0
		this._createTimesList()
		
		this.halfWidth = window.innerWidth / 2
		this.timeSliderWidth = 24 * this.hours + this.times.length + this.halfWidth

		this.initPosition = this._getPosition(this.props.now)
	}

	_createTimesList = () => {
		let timesDay = null
		for (var d = this.props.start; d < this.props.end; d += 3 * 3600 * 1000){
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

	_getPosition = (time) => {
		let hour = Math.floor((time - this.props.start) / (3600 * 1000))
		let border = Math.floor((hour - 3 * this.times[0].hours.length) / 24) + 1
		return hour * 8 + border
	}

	scroll = (e) => {
		this.props.onScroll()

		let scrollLeft = ReactDOM.findDOMNode(this.refs.slider).scrollLeft
		scrollLeft = Math.max(0, Math.min(this.timeSliderWidth, scrollLeft))
		scrollLeft -= Math.floor((scrollLeft / 24 + 8 - this.times[0].hours.length ) / 8)
		let hour = Math.floor(scrollLeft / 8 / this.intervalHour) * this.intervalHour

		let date = this.props.start + hour * 3600 * 1000
		if (date != this.showDate){
			this.showDate = date
			this.props.onChange(date)
		}
	}

	changeInterval = (interval) => {
		this.interval = interval
		if (interval == '3h') this.intervalHour = 3
		if (interval == '1h') this.intervalHour = 1
	}

	componentDidMount() {
		if (this.initPosition){
			ReactDOM.findDOMNode(this.refs.slider).scrollLeft = this.initPosition
		}
	}

	render() {
		if (this.props.interval != this.interval){
			this.changeInterval(this.props.interval)
		}

		styles.timeSlider.width = this.timeSliderWidth

		return (
			<div style={styles.bottomBar}
				onScroll={this.scroll}
				onTouchStart={this.props.onScroll}
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
							return (
								<div key={day.day} style={Object.assign({}, styles.timeSliderDay, { width:49, marginRight:-24, borderLeft:'1px solid #ccc' })}>
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
						width: this.halfWidth,
						display: 'inline-block'
					}}></div>
				</div>
			</div>
		)
	}
}

