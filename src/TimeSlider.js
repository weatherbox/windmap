import React from 'react'
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
		background: '#ccc',
		overflowX: 'scroll'
	},
	timeSlider: {
		width: 1000,
		marginLeft: '50%',
		marginRight: '50%',
		background: '#fff',
		height: 50,
	},
	centerLine: {
		position: 'absolute',
		width: 0,
		height: 50,
		bottom: 0,
		left: '50%',
		border: '1px solid #00f',
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


export default class TimeSlider extends React.Component {
	state = { visible: false }
	
	hide = () => {
		this.setState({ visible: false })
		window.map.off('preclick')
	}

	show = () => {
		this.setState({ visible: true })

		setTimeout(this.hide, 5000)
		window.map.on('preclick', this.hide)
	}

	render() {
		return (
			<div>
				<div style={styles.button} onClick={this.show}>
					12/01 09:00
				</div>

				<Sidebar as='div' animation='overlay' direction='bottom' visible={this.state.visible}>
					<div style={styles.bottomBar}>
						<div style={styles.timeSlider}>test</div>
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

