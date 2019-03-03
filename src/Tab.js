import React from 'react'
import { createBottomTabNavigator } from 'react-navigation'
import TabBar from 'app/TabBar'
import Classic from 'app/Classic'
import Karma from 'app/Karma'
import Mind from 'app/Mind'
import More from 'app/More'
  
const TabNavigator = createBottomTabNavigator({
  Classic,
  Karma,
  Mind,
  More,
}, {
  tabBarComponent: ({navigation}) => <TabBar navigation={navigation} />,
})

export default TabNavigator
