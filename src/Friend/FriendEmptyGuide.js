import React from 'react'
import { 
  ScrollView,
  RefreshControl,
  TouchableOpacity, 
  Text, 
} from 'react-native'
import TYicon from 'app/component/TYicon'

export default class TalkEmptyGuide extends React.Component {
render() {
  const {
    navigation,
    refreshing,
    onRefresh,
    onReload
  } = this.props

  return <ScrollView 
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              onReload={onReload}
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
          <Text style={{
            fontSize: 16,
            color: '#999'
          }}>以下方式添加有缘人~</Text>
          <Text style={{
            marginTop: 20,
            fontSize: 16,
            color: '#999'
          }}>如果不知道对方用户名/邮箱</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Fate')}
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
              marginRight: 10
            }}>去看看，有没有投缘的人</Text>
            <TYicon 
              name='jiantou'
              size={16} 
              color={'#EE3D80'}
              style={{
                marginTop: 10
              }}
            ></TYicon>
          </TouchableOpacity>
          <Text style={{
            color: '#999',
            marginTop: 20,
            fontSize: 16
          }}>如果知道对方的用户名/邮箱</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('UserSearch', {
              onGoBack: onReload
            })}
            style={{
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
              marginRight: 10
            }}>通过用户名/邮箱添加对方</Text>
            <TYicon 
              name='sousuo'
              size={16} 
              color={'#EE3D80'}
              style={{
                marginTop: 10
              }}
            ></TYicon>
          </TouchableOpacity>
        </ScrollView>
  }
}