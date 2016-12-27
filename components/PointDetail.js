import React from 'react'

import { Sidebar } from 'semantic-ui-react'
import MeteogramSky from './meteogram/src/MeteogramSky'


export default class PointDetail extends React.Component {
	render() {
		console.log(this.props)
		return (
			<Sidebar
				as='div'
				animation='overlay'
				direction='bottom'
				visible={this.props.visible}
				style={{ background:'#fff' }}>
				<MeteogramSky lat={this.props.lat} lon={this.props.lon} />
			</Sidebar>
		)
	}
}

