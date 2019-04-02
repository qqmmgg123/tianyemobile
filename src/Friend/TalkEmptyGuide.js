import React from 'react'
import { 
  View, 
  ScrollView,
  RefreshControl,
  TouchableOpacity, 
  Text, 
} from 'react-native'
import TYicon from 'app/component/TYicon'

export default class TalkEmptyGuide extends React.Component {
  
  render() {
    const {
      friendTotal,
      navigation,
      refreshing,
      onRefresh
    } = this.props

    return !friendTotal
      ? 
        <ScrollView 
          contentContainerStyle={{
            flex: 1,
            padding: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Text style={{
            fontSize: 16,
            color: '#999',
            textAlign: 'center',
            lineHeight: 28
          }}>
            您未添加有缘人与您互诉衷肠～
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Friend', {
              routeName: 'Talk',
              onGoBack: () => this.refresh()
            })}
            style={{
              borderRadius: 3,
              justifyContent: 'center',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Text style={{
              marginTop: 10,
              fontSize: 16,
              lineHeight: 28,
              color: '#EE3D80',
              textAlign: 'center',
              width: 200,
              marginRight: 10
            }}>去“有缘人”添加</Text>
            <TYicon
              name='jiantou'
              size={16} 
              color={'#EE3D80'}></TYicon>
          </TouchableOpacity>
        </ScrollView>
      : 
        <ScrollView 
          contentContainerStyle={{
            flex: 1,
            padding: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
        <View style={{
          flex: 1,
          padding: 10,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text 
            style={{
              fontSize: 16,
              color: '#999',
              textAlign: 'center',
              width: '60%',
              lineHeight: 28
            }}
          >
            您的有缘人尚未与您共享内容
          </Text>
        </View>
      </ScrollView>
  }
}