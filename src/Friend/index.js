import React from 'react'
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  Text,
  ScrollView,
  RefreshControl
} from 'react-native'
import { connect } from 'react-redux'
import { get } from 'app/component/request'
import globalStyles from 'app/component/globalStyles'
import FriendItem from 'app/Friend/FriendItem'
import { Empty, Footer } from 'app/component/ListLoad'
import TYicon from 'app/component/TYicon'

let noDataTips = '当前没有内容'

class FriendList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      friends: [],
      loading: true,
      noDataTips,
    }
    props.navigation.setParams({
      component: this
    })
  }

  static navigationOptions = {
    title: '有缘人'
  }

  refresh = () => {
    this.setState({
      refreshing: true
    }, () => {
      this.loadData()
    })
  }

  reload() {
    this.setState({
      loading: true,
      friends: []
    }, () => {
      this.loadData()
    })
  }

  layoutData(data) {
    let { success, friends } = data
    if (success) {
      this.setState({
        friends,
        noDataTips
      })
    }
  }

  async loadData() {
    const { loading, refreshing } =  this.state
    let data = await get('friend')
    if (loading) {
      this.setState({
        loading: false,
        refreshing: false,
      }, () => {
        data && this.layoutData(data)
      })
    }
    if (refreshing) {
      this.setState({
        refreshing: false,
        minds: []
      }, () => {
        data && this.layoutData(data)
      })
    }
  }

  componentWillMount() {
    this.loadData()
  }

  componentWillReceiveProps(props) {
    if (props.loginData.userId !== this.props.loginData.userId) {
      this.reload()
    }
  }

  render() {
    let { 
      friends, 
      loading, 
      refreshing
    } = this.state

    return (
      <View 
        style={[globalStyles.container, {
          zIndex: 0
        }]}
      >
        {this.state.friends.length ? <FlatList
          data={friends}
          refreshing={refreshing}
          onRefresh={this.refresh}
          renderItem={({item, index}) => <FriendItem 
            {...item} 
            onRemove={() => {
              friends.splice(index, 1)
              this.setState({
                friends
              }, () => {
                this.props.screenProps.onFriendChange()
              })
            }} 
            onAccpect={(friendId) => {
              this.props.navigation.navigate('AcceptPrompt', {
                friendId,
                status: 'accept',
                onListRefresh: () => {
                  this.reload()
                  this.props.screenProps.onFriendChange()
                }
              })
            }}
            onDeny={(friendId, animateFun) => {
              this.props.navigation.navigate('AcceptPrompt', {
                friendId,
                status: 'deny',
                onDenyConfirm: () => {
                  animateFun()
                }
              })
            }}
            onRemark={(friendship) => {
              this.props.navigation.navigate('AcceptPrompt', {
                friendship,
                status: 'remark',
                onListRefresh: () => {
                  this.reload()
                  this.props.screenProps.onFriendChange()
                }
              })
            }}
          />}
          ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
          keyExtractor={(item) => (item._id)}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        /> : (!loading ? <ScrollView 
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.refresh}
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
          }}>当前未添加有缘人~</Text>
          {/*<Text style={{
            marginTop: 20,
            color: '#444',
            fontSize: 16
          }}>
            他（她）已经是田野用户
          </Text>*/}
          <Text style={{
            marginTop: 20,
            fontSize: 16,
            color: '#666'
          }}>一、不知道对方用户名、邮箱</Text>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('Fate')}
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
            }}>去“投缘”看看，有没有投缘的人</Text>
            <TYicon 
              name='jiantou'
              size={16} 
              color={'#EE3D80'}></TYicon>
          </TouchableOpacity>
          <Text style={{
            color: '#666',
            marginTop: 20,
            fontSize: 16
          }}>二、知道对方的用户名或邮箱</Text>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('UserSearch', {
              onGoBack: () => this.reload()
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
            }}>通过用户名或邮箱添加</Text>
            <TYicon 
              name='sousuo'
              size={16} 
              color={'#EE3D80'}></TYicon>
          </TouchableOpacity>
          {/*<Text style={{
            marginTop: 30,
            color: '#444',
            fontSize: 16
          }}>他（她）不是心也用户</Text>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('UserSearch', {
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
              marginRight: 10
            }}>邀请他（她）加入心也</Text>
            <TYicon 
              name='yaoqing'
              size={16} 
              color={'#EE3D80'}></TYicon>
          </TouchableOpacity>*/}
        </ScrollView> : <Empty loading={true} />)}
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  const { loginData } = state
  return { loginData }
}

export default connect(mapStateToProps)(FriendList)
