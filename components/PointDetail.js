import React from 'react'

import { Sidebar, Icon } from 'semantic-ui-react'
import MeteogramSky from './meteogram/src/MeteogramSky'

const styles = {
	close: {
		position: 'absolute',
		top: 4,
		right: 4,
		zIndex: 1000,
	}
}

export default class PointDetail extends React.Component {
	render() {
		let meteogram
		if (this.props.lat && this.props.lon){
			meteogram = (<MeteogramSky lat={this.props.lat} lon={this.props.lon} />)
		}

		return (
			<Sidebar
				as='div'
				animation='overlay'
				direction='bottom'
				visible={this.props.visible}
				style={{ background:'#fff', height: 304 }}>
				<Icon name='remove'
					style={styles.close}
					onClick={this.props.close}/>
				{meteogram}
			</Sidebar>
		)
	}
}

