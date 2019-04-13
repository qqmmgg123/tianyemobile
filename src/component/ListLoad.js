import React from 'react'
import { 
  View, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity, 
  Text,
  ActivityIndicator 
} from 'react-native'
import globalStyles from 'app/component/globalStyles'

/**
 * 列表为空时，显示该组件
 * @param {*} props 
 */
export const Empty = (props) =>(<View
  style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }}
>
  {!props.loading ? null : <ActivityIndicator />}
  <Text style={globalStyles.noDataText}>
    {!props.loading ? (props.noDataTips || '当前没有内容') : '加载中...'}
  </Text>
</View>)

/**
 * 列表上拉滚动加载时显示该组件
 * @param {*} props 
 */
export const Footer = (props) => (props.data.length ? (<View>
  {!props.loading ? (props.page ? (<TouchableOpacity
    onPress={props.onLoadMore}
  >
    <Text style={globalStyles.noDataText}>查看更多</Text>
  </TouchableOpacity>) : <Text style={[globalStyles.noDataText, {
    color: '#999'
  }]}>没有更多了。</Text>) : <ActivityIndicator />}
</View>) : null)

/**
 * 列表数据加载错误时显示该组件
 * @param {*} props 
 */
export const PageError = (props) =>(<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={props.refreshing}
      onRefresh={props.onRefresh}
    />
  }
  contentContainerStyle={{
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  }}
  showsVerticalScrollIndicator={false}
  showsHorizontalScrollIndicator={false}
>
  <Text style={globalStyles.noDataText}>
    获取内容失败，请下拉刷新，或检查你的网络～
  </Text>
</ScrollView>)