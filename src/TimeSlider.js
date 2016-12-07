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
		width: 1000,
		marginLeft: '50%',
		marginRight: '50%',
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
						<div style={styles.timeSlider}>
							<div className="time-slider-day">
								12/01<br/>
								<span className="hours">
									<span>00</span>
									<span>03</span>
									<span>06</span>
									<span>09</span>
									<span>12</span>
									<span>15</span>
									<span>18</span>
									<span>21</span>
								</span>
							</div>
							<div className="time-slider-day">
								12/02<br/>
								<span className="hours">
									<span>00</span>
									<span>03</span>
									<span>06</span>
									<span>09</span>
									<span>12</span>
									<span>15</span>
									<span>18</span>
									<span>21</span>
								</span>
							</div>
							<div className="time-slider-day">
								12/03<br/>
								<span className="hours">
									<span>00</span>
									<span>03</span>
									<span>06</span>
									<span>09</span>
									<span>12</span>
									<span>15</span>
									<span>18</span>
									<span>21</span>
								</span>
							</div>
						</div>
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

