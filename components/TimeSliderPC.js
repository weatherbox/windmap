import React from 'react'
import ReactDOM from 'react-dom'
import { Sidebar, Progress } from 'semantic-ui-react'

import Loader from './Loader'

const styles = {
	progressDiv: {
		marginLeft: 20,
		marginBottom: 2,
		display: 'inline-block',
	},
	days: {
		color: '#fff',
		fontSize: 10,
	},
	day: {
		display: 'inline-block',
		textAlign: 'center',
		borderRight: '1px solid rgba(211, 211, 211, 0.7)',
		width: 144,
		height: 12,
		lineHeight: '10px',
	},
	popup: {
		position: 'absolute',
		top: 'auto',
		left: 230,
		width: 88,
		bottom: 30,
		padding: '4px 10px',
		fontSize: 12,
		fontWeight: 'normal',
		lineHeight: '12px',
	},
}

const HOUR = 3600 * 1000


export default class TimeSliderPC extends React.Component {
	state = {
		showPopup: false,
		percent: 0,
		time: '01/01 00:00',
	}

	constructor(props) {
		super(props)

		this.time = this.props.now
		this.state.time = this.props.time
		this.period = this.props.end - this.props.start
		this.state.percent = (this.time - this.props.start) / (this.period) * 100

		this.days = []
		this._createDayList()
	}

	_createDayList = () => {
		let startDate = new Date(this.props.start)
		let hours = 24 - startDate.getHours()
		this.days.push({
			hours: hours,
			day: this._getDayString(startDate)
		})

		for (var d = this.props.start + hours * HOUR; d < this.props.end - 24 * HOUR; d += 24 * HOUR){
			this.days.push({
				hours: 24,
				day: this._getDayString(new Date(d))
			})
		}

		let endDate = new Date(this.props.end)
		this.days.push({
			hours: endDate.getHours(),
			day: this._getDayString(endDate)
		})
	}

	_getDayString = (date) => {
		return (date.getMonth() + 1) + '/' + ('0' + date.getDate()).slice(-2)
	}

	componentDidMount() {
		this.base = ReactDOM.findDOMNode(this.refs.timeSliderPC)
	}

	click = (e) => {
		let baseLeft = this.base.getBoundingClientRect().left
		let hour = Math.round((e.clientX - baseLeft - 20) / 6)
		let date = this.props.start + hour * HOUR

		let percent = (date - this.props.start) / this.period * 100
		if (percent != this.state.percent) this.setState({ percent })

		this.props.onChange(date)
	}

	hover = (e) => {
		let baseLeft = this.base.getBoundingClientRect().left
		let hour = Math.round((e.clientX - baseLeft - 20) / 6)

		let date = new Date(this.props.start + hour * HOUR)
		let day = this._getDayString(date)
		let hh = ('0' + date.getHours()).slice(-2)

		let popupLeft = baseLeft + 20 + 6 * hour - 44
		let time = day + ' ' + hh + ':00'

		if (time != this.state.time) this.setState({ time, popupLeft })
	}

	mouceover = (e) => {
		this.setState({ showPopup: true })
		this.hover(e)
	}

	mouceout = () => {
		this.setState({ showPopup: false })
	}

	render() {
		let days = this.days
		this.width = 6 * ((this.period) / HOUR)

		let progress = (
			<div style={ styles.progressDiv }
				onClick={this.click}
				onMouseOver={this.mouceover}
				onMouseMove={this.hover}
				onMouseOut={this.mouceout}>
				<Progress
					size='tiny'
					color='blue'
					className='time-slider-progress'
					percent={this.state.percent}
					style={{ width: this.width, marginBottom: 4 }} />

				<div style={ styles.days }>
					{days.map((d, i) => {
						let style = Object.assign({}, styles.day)
						let last = (i == days.length - 1)
						let width = 6 * d.hours
						if (!last) width -= 1
						style.width = 6 * d.hours - last
						if (last) style.borderRight = 'none'
						let day = (d.hours > 3) ? d.day : ''

						return (
							<div style={style} key={i}>{day}</div>
						)
					})}
				</div>

			</div>
		)

		let stylePopup = Object.assign({}, styles.popup, { left: this.state.popupLeft })

		return (
			<div style={{ display:'inline-block', verticalAlign:'bottom' }}>
				<Sidebar
					as='div'
					animation='overlay'
					direction='bottom'
					className='time-slider-pc'
					ref='timeSliderPC'
					visible={this.props.visible}>
					{ this.props.visible && progress }
				</Sidebar>

				<div className={'ui popup transition top center ' + ((this.props.visible && this.state.showPopup) ? "visible" : "")} style={stylePopup}>
					{this.state.time}
				</div>
			</div>
		)
	}
}
