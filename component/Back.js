import React from 'react'
import TYicon from '../TYicon'
import { TouchableOpacity, Text } from 'react-native'

const Back = (props) => {
  const { routeName, name } = props
  return (
    <TouchableOpacity
      onPress={props.navigation ? (routeName 
        ? () => props.navigation.navigate(routeName) 
        : () => props.navigation.goBack()) : () => props.goBack()}
      style={{
        padding: 10,
        flexDirection: 'row',
        borderBottomColor: '#eaeaea',
        borderBottomWidth: 1,
        borderStyle: 'solid'
      }}
    >
      <TYicon name='fanhui' size={16} color='#333333'></TYicon>
      <Text style={{ paddingLeft: 5, fontSize: 14, color: '#333333' }}>
        {name ? name : '返回'}
      </Text>
    </TouchableOpacity>
  )
}

export default Back
