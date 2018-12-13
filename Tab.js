import React from 'react'
import { createAppContainer, createBottomTabNavigator } from 'react-navigation'
import TabBar from './TabBar'
import Classic from './Classic'
import Share from './Share'
import Diary from './Diary'
  
const AppNavigator = createBottomTabNavigator({
  Classic,
  Share,
  Diary
}, {
  tabBarComponent: ({navigation}) => <TabBar navigation={navigation} />
})

export default createAppContainer(AppNavigator)
