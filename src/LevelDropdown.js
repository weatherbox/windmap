import React from 'react'
import { Dropdown } from 'semantic-ui-react'

const style = {
	position: 'absolute',
	bottom: 10,
	left: 10,
	zIndex: 20,
	color: '#fff'
}

const LevelDropdown = () => (
  <Dropdown text='Surface' pointing='bottom left' icon={null} style={style}>
    <Dropdown.Menu>
      <Dropdown.Item text='9000m' value='300' description='300hPa' />
      <Dropdown.Item text='5500m' value='500' description='500hPa' />
      <Dropdown.Item text='3000m' value='700' description='700hPa' />
      <Dropdown.Item text='1500m' value='850' description='850hPa' />
      <Dropdown.Item text='900m' value='900' description='900hPa' />
      <Dropdown.Item text='750m' value='925' description='925hPa' />
      <Dropdown.Item text='600m' value='950' description='950hPa' />
      <Dropdown.Item text='300m' value='975' description='975hPa' />
      <Dropdown.Item text='100m' value='1000' description='1000hPa' />
      <Dropdown.Item text='Surface' value='surface' />
    </Dropdown.Menu>
  </Dropdown>
)

export default LevelDropdown



