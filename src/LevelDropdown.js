import React from 'react'
import { Dropdown } from 'semantic-ui-react'

const style = {
	position: 'absolute',
	bottom: 10,
	left: 10,
	zIndex: 20,
	color: '#fff',
	fontSize: 16
}

const options = [
	{ value: '300', text: '9000m', description: '300hPa' },
	{ value: '500', text: '5500m', description: '500hPa' },
	{ value: '700', text: '3000m', description: '700hPa' },
	{ value: '850', text: '1500m', description: '850hPa' },
	{ value: '900', text: '900m', description: '900hPa' },
	{ value: '925', text: '750m', description: '925hPa' },
	{ value: '950', text: '600m', description: '950hPa' },
	{ value: '975', text: '300m', description: '975hPa' },
	{ value: '1000', text: '100m', description: '1000hPa' },
	{ value: 'surface', text: 'Surface' },
]

export default class LevelDropdown extends React.Component {
	handleChange = (e, {value}) => {
		console.log(value)
	}

	render() {
		return (
			<Dropdown
				className='level-dropdown'
				options={options}
				defaultValue='surface'
				onChange={this.handleChange}
				pointing='bottom left'
				icon={null}
				style={style} 
			/>
		)
	}
}

