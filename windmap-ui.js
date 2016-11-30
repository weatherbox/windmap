import React from 'react'
import { render } from 'react-dom'

import LevelDropdown from './src/LevelDropdown'

class WindmapUI extends React.Component {
	render() {
		return (
			<div>
				<LevelDropdown />
			</div>
		)
	}
}


render(
	<WindmapUI />,
	document.getElementById('app')
)

