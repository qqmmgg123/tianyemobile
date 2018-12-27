import React, { Component } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native'
import { post, getCurRoute } from './request'


export default class Login extends Component {

  constructor(props) {
    super(props)
    this.state = { 
      username: '',
      password: ''
    }
  }

  static navigationOptions = {
    drawerLabel: '登录'
  };

  async postLogin() {
    const { username, password } = this.state
    let res = await post('login', {
      username,
      password
    })
    console.log(res)
    if (res.success) {
      this.props.navigation.closeDrawer()
      let curRoute = getCurRoute()
      if (curRoute) {
        this.props.navigation.navigate(curRoute)
      }
    }
  }

  render() {
    return (
      <View
        style={{
          paddingTop: 3,
          paddingHorizontal: 7,
          paddingBottom: 4
        }}
      >
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate('Home')}
        >
          <Text>返回首页</Text>
        </TouchableOpacity>
        <TextInput
          onChangeText={(username) => this.setState({username})}
          value={this.state.username}
          style={{
            borderColor: '#cccccc', 
            borderWidth: 1,
            height: 36,
            paddingTop: 3,
            paddingHorizontal: 7,
            paddingBottom: 4,
            borderRadius: 3,
            marginTop: 10
          }}
          placeholder="用户名"
          placeholderTextColor="#cccccc"
          allowFontScaling={false}
          autoCapitalize="none"
          textContentType="username"
        />
        <TextInput
          style={{
            borderColor: '#cccccc', 
            borderWidth: 1,
            height: 36,
            paddingTop: 3,
            paddingHorizontal: 7,
            paddingBottom: 4,
            borderRadius: 3,
            marginTop: 10
          }}
          placeholder="密码"
          placeholderTextColor="#cccccc"
          allowFontScaling={false}
          autoCapitalize="none"
          secureTextEntry={true}
          textContentType="password"
          onChangeText={(password) => this.setState({password})}
          value={this.state.password}
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
            marginTop: 10
          }}
          onPress={this.postLogin.bind(this)}
        >
          <Text style={{
            alignItems: 'center', 
            color: '#666666', 
            textAlign: 'center'
          }}>登录</Text>
        </TouchableOpacity>
      </View>
    )
  }
}
