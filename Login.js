import React, { Component } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { connect } from 'react-redux'
import Spinner from 'react-native-loading-spinner-overlay'
import globalStyles from './globalStyles'
import { post, getCurRoute } from './request'
import Back from './component/Back'

function alert(msg) {
  Alert.alert(
    null,
    msg,
    [
      {text: '确定'},
    ],
    { cancelable: true }
  )
}

class Login extends Component {

  constructor(props) {
    super(props)
    this.state = { 
      username: '',
      password: '',
      spinner: false,
      spinnerText: '',
    }
  }

  async postLogin() {
    const { username, password } = this.state
    this.setState({
      spinner: true,
      spinnerText: '',
    })
    let res = await post('login', {
      username,
      password
    })
    this.setState({
      spinner: false,
      spinnerText: '',
    })
    if (res) {
      const { success } = res
      if (success) {
        let curRoute = getCurRoute()
        if (curRoute) {
          this.props.navigation.navigate(curRoute)
        }
      }
    }
  }

  render() {
    let { loginData } = this.props
    let { need_login } = loginData
    let { username = '', password = '', spinner, spinnerText } = this.state
    const submitBtnDis = !username.trim() || !password.trim()

    return (
      <View
        style={{
          paddingTop: 3,
          paddingHorizontal: 7,
          paddingBottom: 4
        }}
      >
        <Spinner
          visible={spinner}
          textContent={spinnerText}
          textStyle={{
            color: '#333'
          }}
          color='#666'
          overlayColor='rgba(255,255,255, 0.25)'
        />
        <Back 
          navigation={this.props.navigation}
          rightButton={need_login ? {
            name: '注册',
            routeName: 'Signup'
          } : null}
        />
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
          activeOpacity={submitBtnDis 
            ? 1
            : 0.6}
          style={[
            globalStyles.button, 
            submitBtnDis 
              ? globalStyles.buttonDis 
              : null, 
            {
              marginTop: 10
            }
          ]}
          onPress={submitBtnDis 
            ? null
            : this.postLogin.bind(this)}
        >
          <Text style={[
            globalStyles.buttonText, 
            submitBtnDis 
              ? globalStyles.buttonDisText 
              : null
            ]}
          >登录</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  const { loginData } = state
  return { loginData }
}

export default connect(mapStateToProps)(Login)
