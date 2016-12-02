import React from 'react'


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
		position: 'absolute',
		bottom: 0,
		left: 0,
		width: '100%',
		height: 50,
		zIndex: 21,
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
		zIndex: 22
	},
	popup: {
		top: 'auto',
		bottom: 50,
		right: '50%',
		marginRight: -53
	}
}


export default class TimeSlider extends React.Component {

	render() {
		return (
			<div>
				<div style={styles.button} onClick={this.showSlider}>
					12/01 09:00
				</div>

				<div style={styles.bottomBar}>
					<div style={styles.timeSlider}>test</div>
				</div>

				<div style={styles.centerLine}></div>

				<div className='ui popup transition visible top center' style={styles.popup}>
					12/01 09:00
				</div>
			</div>
		)
	}
}

