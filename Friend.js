/* import React, { Component } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native'
import Back from './component/Back'

export default class Friend extends Component {

  constructor(props) {
    super(props)
    this.state = { 
      query: ''
    }
  }

  static navigationOptions = {
    drawerLabel: '知己',
  };

  render() {
    return (
      <View style={{
        paddingHorizontal: 10,
        paddingBottom: 20
      }}>
        <Back 
          navigation={this.props.navigation}
          name='返回首页'
          routeName='Home'
        />
        <View style={{
          flexDirection: 'row', 
          alignItems: 'center',
          marginTop: 20
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
            placeholder="请输入对方用户名或邮箱"
            placeholderTextColor="#cccccc"
            allowFontScaling={false}
            onChangeText={(query) => this.setState({query})}
            value={this.state.query}
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
          >
            <Text style={{alignItems: 'center', color: '#666666'}}>查找</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
} */

import React from 'react'
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Text,
  Animated,
  Modal
} from 'react-native'
import { get, del, put } from './request'
import globalStyles from './globalStyles'
import Back from './component/Back'

let noDataTips = '当前没有内容'

const ANIMATION_DURATION = 250

class FriendItem extends React.Component {

  constructor(props) {
    super(props)
    this._animated = new Animated.Value(1);
  }

  async removeDiary(id) {
    const res = await del(`diary/${id}`)
    if (res.success) {
      this.onRemove()
    }
  }

  friendAccept(id) {
    const { onAccpect } = this.props
    if (onAccpect) {
      onAccpect(id)
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
    if (status === 1 && recipient_status === 2) {
      state ='等待对方验证...'
      btns = (
        <View>
          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => this.removeDiary(_id)}
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
            onPress={() => this.removeDiary(_id)}
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
            onPress={() => this.friendAccept()}
          >
            <Text style={globalStyles.buttonText}>修改备注名</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => this.removeDiary(_id)}
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

export default class FriendList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      friends: [],
      noDataTips,
      friendId: '',
      remark: '',
      modalVisible: false
    }
  }

  static navigationOptions = {
    drawerLabel: '知己',
  };

  refresh() {
    this.loaderData()
  }

  async loaderData() {
    let data = await get('friend')
    let { success, friends } = data
    console.log(friends)
    if (success) {
      this.setState({
        friends,
        noDataTips
      })
    }
  }

  setModalVisible(visible) {
    this.setState({
      modalVisible: visible
    })
  }

  componentWillMount() {
    this.loaderData()
  }

  async acceptConfirm(id) {
    const res = await put(`friend/${id}/accept`, {
      remark: this.state.remark
    })
    if (res) {
      const { success } = res
      if (success) {
        this.refresh()
      }
    }
  }

  render() {
    let { friends } = this.state

    return (
      <View style={{flex: 1}}>
        <Back navigation={this.props.navigation} />
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
            placeholder="请输入对方用户名或邮箱"
            placeholderTextColor="#cccccc"
            allowFontScaling={false}
            autoCapitalize="none"
            onChangeText={(query) => this.setState({query})}
            value={this.state.query}
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
          >
            <Text style={{alignItems: 'center', color: '#666666'}}>查找</Text>
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
              this.setModalVisible(!this.state.modalVisible)
              this.setState({
                friendId,
                remark: ''
              })
            }}
          />}
          ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
          keyExtractor={(item) => (item._id)}
        /> : (<View>
          <Text style={{
            marginTop: 10,
            color: '#666666',
            textAlign: 'center',
            fontSize: 14,
            padding: 10
          }}>
            {this.state.noDataTips}
          </Text>
        </View>)}
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {this.setModalVisible(false)}}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPressOut={() => this.setModalVisible(false)}
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
              <TextInput
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
                onChangeText={(remark) => this.setState({remark})}
                value={this.state.remark}
              />
              <View style={{
                flexDirection: 'row'
              }}>
                <TouchableOpacity
                  style={[globalStyles.button, { flex: 1 }]}
                  onPress={() => {
                    this.acceptConfirm(this.state.friendId)
                    this.setModalVisible(false)
                  }}>
                  <Text style={globalStyles.buttonText}>确定</Text>
                </TouchableOpacity>
                <View style={{ width: 10 }} />
                <TouchableOpacity
                  style={[globalStyles.button, { flex: 1 }]}
                  onPress={() => {
                    this.setModalVisible(false)
                  }}>
                  <Text style={globalStyles.buttonText}>取消</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    )
  }
}
