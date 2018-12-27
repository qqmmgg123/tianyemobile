import React from 'react'
import { createBottomTabNavigator } from 'react-navigation'
import TabBar from './TabBar'
import Classic from './Classic'
import Share from './Share'
import Help from './Help'
import Diary from './Diary'
  
const TabNavigator = createBottomTabNavigator({
  Classic,
  Share,
  Help,
  Diary
}, {
  tabBarComponent: ({navigation}) => <TabBar navigation={navigation} />,
})

export default TabNavigator
