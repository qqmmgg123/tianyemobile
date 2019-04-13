/**
 * 主功能tab导航
 */
import React from 'react'
import { createBottomTabNavigator } from 'react-navigation'
import TabBar from 'app/TabBar'
import Earth from 'app/Earth'
import Karma from 'app/Karma'
import Mind from 'app/Mind'
import More from 'app/More'
  
const TabNavigator = createBottomTabNavigator({
  Earth,
  Karma,
  Mind,
  More,
}, {
  tabBarComponent: ({navigation}) => <TabBar navigation={navigation} />
})

export default TabNavigator
