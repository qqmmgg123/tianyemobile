
import React from 'react'
import { 
  KeyboardAvoidingView,
  View, 
  ScrollView,
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Text,
  Animated,
} from 'react-native'
import { createStackNavigator } from 'react-navigation'
import { get, del, put, post } from './request'
import globalStyles from './globalStyles'
import Back from './component/Back'
import { connect } from 'react-redux'
import { createFriendModal } from './GlobalModal'

let noDataTips = '当前没有内容'

const ANIMATION_DURATION = 250

class AcceptPrompt extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      remark: ''
    }
  }

  async requestConfirm() {
    const id = this.props.modal.getParam('friendId')
    let res = await post(`friend/${id}/send`, {
      content: this.state.content,
      remark: this.state.remark,
    })
    if (res) {
      const { success } = res
      if (success) {
        this.props.onAdd()
      }
    }
  }

  async acceptConfirm() {
    const id = this.props.modal.getParam('friendId')
    const res = await put(`friend/${id}/accept`, {
      content: this.state.content
    })
    if (res) {
      const { success } = res
      if (success) {
        this.props.listRefresh()
      }
    }
  }

  async denyConfirm() {
    const id = this.props.modal.getParam('friendId')
    const onDenyConfirm = this.props.modal.getParam('onDenyConfirm')
    const res = await del(`/friend/${id}/remove`, {
      remark: this.state.remark
    })
    if (res) {
      const { success } = res
      if (success) {
        onDenyConfirm()
      }
    }
  }

  async remarkConfirm() {
    const id = this.props.modal.getParam('friendId')
    const res = await put(`/friend/${id}/remark`, {
      remark: this.state.remark
    })
    if (res) {
      const { success } = res
      if (success) {
        this.props.listRefresh()
      }
    }
  }

  resetState() {
    this.setState({
      remark: '',
      content: ''
    })
  }

  render() {
    const status = this.props.modal.getParam('status')

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior='height'
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPressOut={() => this.props.modal.close()}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
        >
          <View style={{
            width: 250,
            backgroundColor: 'white',
            borderRadius: 3,
            padding: 10
          }}>
            {status === 'add' || status === 'deny' ? (<TextInput
              autoFocus={true}
              style={{
                borderColor: '#cccccc', 
                borderWidth: 1,
                paddingTop: 3,
                paddingHorizontal: 7,
                paddingBottom: 4,
                borderRadius: 3,
                marginTop: 10,
                minHeight: 36
              }}
              placeholder='说点什么...'
              placeholderTextColor="#cccccc"
              autoCapitalize="none"
              onChangeText={(content) => {
                this.setState({content})
              }}
              value={this.state.content}
            />) : null}
            {status === 'add' || status === 'accept' || status === 'remark' ? (<TextInput
              autoFocus={true}
              style={{
                borderColor: '#cccccc', 
                borderWidth: 1,
                paddingTop: 3,
                paddingHorizontal: 7,
                paddingBottom: 4,
                borderRadius: 3,
                marginTop: 10,
                minHeight: 36
              }}
              placeholder='备注名'
              placeholderTextColor="#cccccc"
              autoCapitalize="none"
              onChangeText={(remark) => {
                this.setState({remark})
              }}
              value={this.state.remark}
            />) : null}
            <View style={{
              marginTop: 10,
              flexDirection: 'row'
            }}>
              <TouchableOpacity
                style={[globalStyles.button, { 
                  flex: 1,
                }]}
                onPress={() => {
                  switch (status) {
                    case 'add':
                      this.requestConfirm()
                      break
                    case 'accept':
                      this.acceptConfirm()
                      break
                    case 'deny':
                      this.denyConfirm()
                      break
                    case 'remark':
                      this.remarkConfirm()
                      break
                  }
                  this.props.modal.close()
                }}>
                <Text style={globalStyles.buttonText}>{status === 'add'? '送出' : '确定'}</Text>
              </TouchableOpacity>
              <View style={{ width: 10 }} />
              <TouchableOpacity
                style={[globalStyles.button, { flex: 1 }]}
                onPress={() => {
                  this.props.modal.close()
                }}>
                <Text style={globalStyles.buttonText}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    )
  }
}

class FriendItem extends React.Component {

  constructor(props) {
    super(props)
    this._animated = new Animated.Value(1);
  }

  async removeFriend(id) {
    let res = await del(`friend/${id}/remove`)
    if (res) {
      const { success } = res
      if (success) {
        this.onRemove()
      }
    }
  }

  friendAccept(id) {
    const { onAccpect } = this.props
    if (onAccpect) {
      onAccpect(id)
    }
  }

  friendDeny(id) {
    const { onDeny } = this.props
    if (onDeny) {
      onDeny(id, () => {
        this.onRemove()
      })
    }
  }

  friendRemarkt(id) {
    const { onRemark } = this.props
    if (onRemark) {
      onRemark(id)
    }
  }

  onRemove = () => {
    const { onRemove } = this.props
    if (onRemove) {
      Animated.timing(this._animated, {
        toValue: 0,
        duration: ANIMATION_DURATION,
      }).start(() => onRemove())
    }
  }

  render() {
    const rowStyles = [
      { opacity: this._animated }
    ]
    const { 
      status, 
      recipient_status, 
      remark, 
      recipient_name, 
      content,
      recipient_id
    } = this.props

    let state = ''
    let message = ''
    let btns = null
    if (status === 1 && recipient_status === 0) {
      state ='拒绝了你的申请...'
      btns = (
        <View>
          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => this.removeFriend(recipient_id)}
          >
            <Text style={globalStyles.buttonText}>删除</Text>
          </TouchableOpacity>
        </View>
      )
    } else if (status === 1 && recipient_status === 2) {
      state ='等待对方验证...'
      btns = (
        <View>
          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => this.removeFriend(recipient_id)}
          >
            <Text style={globalStyles.buttonText}>取消</Text>
          </TouchableOpacity>
        </View>
      )
    } else if (status === 2 && recipient_status === 1) {
      state = '申请加您为知己?'
      message = content
      btns = (
        <View style={{
          // flexDirection: 'row',
          // flexWrap: 'wrap'
        }}>
          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => this.friendAccept(recipient_id)}
          >
            <Text style={globalStyles.buttonText}>同意</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => this.friendDeny(recipient_id)}
          >
            <Text style={globalStyles.buttonText}>拒绝</Text>
          </TouchableOpacity>
        </View>
      )
    } else if (status === 3 && recipient_status === 3) {
      btns = (
        <View style={{
          // flexDirection: 'row',
          // flexWrap: 'wrap'
        }}>
          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => this.friendRemarkt(recipient_id)}
          >
            <Text style={globalStyles.buttonText}>修改备注名</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => this.removeFriend(recipient_id)}
          >
            <Text style={globalStyles.buttonText}>删除</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <Animated.View style={rowStyles}>
        <View style={{
          padding: 10,
          flexDirection: 'row'
        }}>
          <View style={{
            flex: 1
          }}>
            <TouchableOpacity>
              <Text style={{ 
                fontSize: 16,
                color: '#333333',
                lineHeight: 24
                }}>{remark || recipient_name || ''}</Text>
            </TouchableOpacity>
            {state ? (<Text style={{ 
              fontSize: 12,
              color: '#999999',
              lineHeight: 24
            }}>
              {state}
            </Text>) : null}
            {message ? (<Text style={{ 
              fontSize: 14,
              color: '#666666',
              lineHeight: 24
            }}>
              {message}
            </Text>) : null}
          </View>
          {btns}
        </View>
      </Animated.View>
    )
  }
}

const AcceptModal = createFriendModal({ AcceptPrompt })

class FriendList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      friends: [],
      noDataTips,
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
      <View style={{flex: 1}}>
        <Back routeName='Help' navigation={this.props.navigation} />
        <View style={{
          flexDirection: 'row', 
          alignItems: 'center',
          marginTop: 10,
          padding: 10
        }}>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('UserSearch', {
              onGoBack: () => this.refresh()
            })}
            style={{
              borderColor: '#cccccc', 
              borderWidth: 1,
              height: 36,
              paddingTop: 3,
              paddingHorizontal: 7,
              paddingBottom: 4,
              borderRadius: 3,
              justifyContent: 'center',
              flex: 1
            }}
          >
            <Text style={{
              color: '#ccc'
            }}>查找您要添加的知己...</Text>
          </TouchableOpacity>
        </View>
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
        /> : (<View>
          <Text style={globalStyles.noDataText}>
            {this.state.noDataTips}
          </Text>
        </View>)}
        <AcceptModal 
          ref={ref => this._modal = ref}
          listRefresh={() => this.refresh()}
        />
      </View>
    )
  }
}

class UserSearch extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      query: '',
      users: [],
      noUserResult: '',
      modalVisible: false
    }
  }

  async searchUser() {
    let res = await get('user/search', {
      username: this.state.query.trim()
    })
    if (res) {
      const { success, users = [], noUserResult = '' } = res
      if (success) {
        this.setState({
          users,
          noUserResult
        })
      }
    }
  }

  render() {
    let { users, noUserResult } = this.state
    let { userId } = this.props.loginData

    return (
      <View 
        style={{
          flex: 1
        }}
      >
        <Back goBack={() => this.props.navigation.goBack()} />
        <View style={{
          flexDirection: 'row', 
          alignItems: 'center',
          marginTop: 10,
          padding: 10
        }}>
          <TextInput
            style={{
              borderColor: '#cccccc', 
              borderWidth: 1,
              height: 36,
              paddingTop: 3,
              paddingHorizontal: 7,
              paddingBottom: 4,
              borderRadius: 3,
              flex: 1
            }}
            placeholder="请输入对方用户名或邮箱..."
            placeholderTextColor="#cccccc"
            allowFontScaling={false}
            autoCapitalize="none"
            onChangeText={(query) => this.setState({query})}
            value={this.state.query}
            autoFocus={true}
          />
          <TouchableOpacity
            style={{
              borderColor: '#dddddd', 
              borderWidth: 1, 
              borderRadius: 3,
              justifyContent: 'center',
              height: 36,
              paddingTop: 3,
              paddingHorizontal: 7,
              paddingBottom: 4,
              marginLeft: 10
            }}
            onPress={() => this.searchUser()}
          >
            <Text style={{alignItems: 'center', color: '#666666'}}>查找</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{
          padding: 10
        }}>
          {users && users.length ? users.map(item => (
            <View 
              key={item._id} 
              style={{
                flexDirection: 'row'
              }}
            >
              <Text numberOfLines={1} style={{
                flex: 1
              }}>{item.username}</Text>
              {item.isfriend ? (<Text>知己</Text>) : (userId !== item._id ? (
                <TouchableOpacity
                  style={globalStyles.button}
                  onPress={() => {
                    this._modal.open()
                    this._modal.setParams({
                      friendId: item._id,
                      status: 'add'
                    })
                  }}
                >
                  <Text style={globalStyles.buttonText}>添加</Text>
                </TouchableOpacity>
              ) : null)}
            </View>
          )) : (
            <View>
              <Text style={globalStyles.noDataText}>{noUserResult}</Text>
            </View>
          )}
        </ScrollView>
        <AcceptModal 
          ref={ref => this._modal = ref}
          onAdd={() => {
            this.props.navigation.goBack()
            this.props.navigation.state.params.onGoBack();
          }}
        />
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  const { loginData } = state
  return { loginData }
}

const UserSearchScreen = connect(mapStateToProps)(UserSearch)

export default createStackNavigator({
  FriendList,
  UserSearch: UserSearchScreen
}, {
  headerMode: 'none',
  mode: 'modal'
})
