import React from 'react'
import { Dropdown } from 'semantic-ui-react'

const style = {
	zIndex: 20,
	color: '#fff',
	fontSize: 16,
	marginLeft: 12,
	paddingBottom: 10,
}

const options = [
	{ value: 'wind', text: 'Wind' },
	{ value: 'temp', text: 'Temperature' },
	{ value: 'humidity', text: 'Humidity' },
	{ value: 'cloud', text: 'Cloud' },
	{ value: 'rain', text: 'Rain' },
	{ value: 'press', text: 'Pressure' },
]

export default class LevelDropdown extends React.Component {
	handleChange = (e, {value}) => {
		window.windmap.setElement(value)
	}

	render() {
		return (
			<Dropdown
				className='element-dropdown'
				options={options}
				defaultValue='wind'
				onChange={this.handleChange}
				pointing='bottom left'
				icon={null}
				style={style} 
			/>
		)
	}
}

