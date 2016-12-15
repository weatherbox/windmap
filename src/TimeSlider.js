import React from 'react'
import ReactDOM from 'react-dom'
import { Sidebar } from 'semantic-ui-react'

const styles = {
	button: {
		marginLeft: 12,
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
	}
}

const timeToHideBottomBar = 3000
const timeToUpdate = 1000

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

		return (
			<div style={{ display:'inline-block' }}>
				<div style={styles.button} onClick={this.show}>
					{this.state.time}
				</div>

				<Sidebar as='div' animation='overlay' direction='bottom' visible={this.state.visible}>
					<TimeSliderHours
						start={this.start}
						end={this.end}
						now={this.now}
						interval={this.props.interval}
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
						width: this.halfWidth,
						display: 'inline-block'
					}}></div>
				</div>
			</div>
		)
	}
}



