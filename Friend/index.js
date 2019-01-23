import React from 'react'
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  Text,
  findNodeHandle
} from 'react-native'
import { createStackNavigator } from 'react-navigation'
import { get } from '../request'
import globalStyles from '../globalStyles'
import Back from '../component/Back'
import UserSearchScreen from './UserSearch'
import FriendItem from './FriendItem'
import AcceptPrompt from './AcceptPrompt'
import { createFriendModal } from '../GlobalModal'
import TYicon from '../TYicon'

const AcceptModal = createFriendModal({ AcceptPrompt })

let noDataTips = '当前没有内容'

class FriendList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      friends: [],
      noDataTips,
      deopdownShow: false
    }
  }

  refresh() {
    this.loaderData()
  }

  async loaderData() {
    let data = await get('friend')
    let { success, friends } = data
    if (success) {
      this.setState({
        friends,
        noDataTips
      })
    }
  }

  componentWillMount() {
    this.loaderData()
  }

  render() {
    let { friends } = this.state

    return (
      <View 
        onStartShouldSetResponderCapture={(e) => {
          let target = e.nativeEvent.target
          if (target !== findNodeHandle(this._dropdown)) {
            this.setState({
              deopdownShow: false
            })
          }
        }}
        style={{flex: 1}}>
        <Back 
          routeName={this.props.navigation.state.params.routeName}
          navigation={this.props.navigation} 
          rightButton={{
            icon: 'mn_tianjiahaoyou',
            noBorder: true,
            onPress: () => {
              this.setState({
                deopdownShow: !this.state.deopdownShow
              })
            }
          }}
        />
        {this.state.deopdownShow ? (<View 
        ref={ref => this._dropdown = ref}
        style={{
          backgroundColor: '#fff',
          position: 'absolute',
          right: 10,
          top: 42,
          padding: 10,
          zIndex: 999,
          elevation:4,
          shadowOffset: { width: 5, height: 5 },
          shadowColor: "grey",
          shadowOpacity: 0.5,
          shadowRadius: 10,
          borderRadius: 3,
        }}>
          <TouchableOpacity 
            onPress={() => {
              this.props.navigation.navigate('UserSearch', {
                onGoBack: () => this.refresh()
              })
              this.setState({ deopdownShow: false })
            }}
            style={{
              padding: 10
            }}
          >
            <Text>查找添加</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{
            padding: 10
          }}>
            <Text>邀请加入</Text>
          </TouchableOpacity>
        </View>) : null}
        {this.state.friends.length ? <FlatList
          style={{
            marginTop: 10
          }}
          data={this.state.friends}
          renderItem={({item, index}) => <FriendItem 
            {...item} 
            onRemove={() => {
              friends.splice(index, 1)
              this.setState({
                friends
              })
            }} 
            onAccpect={(friendId) => {
              this._modal.open()
              this._modal.setParams({
                friendId,
                status: 'accept'
              })
            }}
            onDeny={(friendId, animateFun) => {
              this._modal.open()
              this._modal.setParams({
                friendId,
                status: 'deny',
                onDenyConfirm: () => {
                  animateFun()
                }
              })
            }}
            onRemark={(friendId) => {
              this._modal.open()
              this._modal.setParams({
                friendId,
                status: 'remark'
              })
            }}
          />}
          ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
          keyExtractor={(item) => (item._id)}
        /> : (        <View style={{
          marginTop: 10,
          padding: 10
        }}>
          <Text style={{
            fontSize: 16,
            lineHeight: 28
          }}>当前您没有添加知己，请按以下步骤操作：</Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 16,
              lineHeight: 28
            }}>
              您的知己已经是心也用户，
            </Text>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('UserSearch', {
                onGoBack: () => this.refresh()
              })}
              style={{
                height: 36,
                paddingTop: 3,
                paddingHorizontal: 7,
                paddingBottom: 4,
                borderRadius: 3,
                justifyContent: 'center',
                flexDirection: 'row',
                flex: 1
              }}
            >
              <TYicon 
                name='sousuo'
                size={24} 
                color={'#333333'}></TYicon>
              <Text style={{
                fontSize: 16,
                lineHeight: 28,
                color: '#666',
                marginLeft: 10
              }}>查找并添加</Text>
            </TouchableOpacity>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Text>您的知己不是心也用户</Text>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('UserSearch', {
                onGoBack: () => this.refresh()
              })}
              style={{
                height: 36,
                paddingTop: 3,
                paddingHorizontal: 7,
                paddingBottom: 4,
                borderRadius: 3,
                justifyContent: 'center',
                flexDirection: 'row',
                flex: 1
              }}
            >
              <TYicon 
                name='yaoqing'
                size={24} 
                color={'#333333'}></TYicon>
              <Text style={{
                fontSize: 16,
                lineHeight: 28,
                color: '#666',
                marginLeft: 10
              }}>邀请他（她）加入心也</Text>
            </TouchableOpacity>
          </View>
        </View>)}
        <AcceptModal 
          ref={ref => this._modal = ref}
          listRefresh={() => this.refresh()}
        />
      </View>
    )
  }
}

export default createStackNavigator({
  FriendList,
  UserSearch: UserSearchScreen
}, {
  headerMode: 'none',
  mode: 'modal'
})
