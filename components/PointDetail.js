import React from 'react'

import { Sidebar, Icon } from 'semantic-ui-react'
import MeteogramSky from './meteogram/src/MeteogramSky'

const styles = {
	close: {
		position: 'absolute',
		top: 6,
		right: 6,
		zIndex: 1000,
	}
}

export default class PointDetail extends React.Component {
	render() {
		let { lat, lon } = this.props

		let meteogram
		if (lat && lon){
			meteogram = (<MeteogramSky lat={lat} lon={lon} />)
		}

		return (
			<Sidebar
				as='div'
				animation='overlay'
				direction='bottom'
				visible={this.props.visible}
				style={{ background:'#fff' }}>
				<Icon name='remove'
					style={styles.close}
					onClick={this.props.close}/>
				{meteogram}
			</Sidebar>
		)
	}
}

