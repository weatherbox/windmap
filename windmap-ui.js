import React from 'react'
import { render } from 'react-dom'

import LevelDropdown from './src/LevelDropdown'
import ElementDropdown from './src/ElementDropdown'

class WindmapUI extends React.Component {
	render() {
		return (
			<div>
				<LevelDropdown />
				<ElementDropdown />
			</div>
		)
	}
}


render(
	<WindmapUI />,
	document.getElementById('app')
)

