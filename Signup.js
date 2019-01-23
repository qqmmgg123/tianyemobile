import React, { Component } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import { post, getCurRoute } from './request'
import Back from './component/Back'
import globalStyles from './globalStyles'
import { toast } from './Toast'
import Spinner from 'react-native-loading-spinner-overlay'

export default class Signup extends Component {

  constructor(props) {
    super(props)
    this.state = { 
      username: '',
      password: '',
      email: '',
      code: '',
      codeSending: false,
      spinner: false,
      spinnerText: '',
      codeBtnDis: false,
      codeBtnText: '发送验证码',
      countDown: null
    }
  }

  async postLogin() {
    const { username, password, email, code } = this.state
    this.setState({
      spinner: true,
      spinnerText: '',
      submitBtnDis: true
    })
    let res = await post('signup', {
      username,
      password,
      email,
      code,
    })
    this.setState({
      spinner: false,
      spinnerText: '',
      submitBtnDis: false
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

  sendCode = async () => {
    const { email } = this.state
    this.setState({
      codeSending: true
    })
    let res = await post('email/vcode', {
      email
    })
    if (res) {
      const { success } = res
      if (success) {
        let timer = null
        let time = 30
        this.setState({
          codeBtnText: '秒后重发',
          codeBtnDis: true,
          codeSending: false
        }, () => {
          toast('验证码发送成功，有效时间10分钟。')
        })
        timer = setInterval(() => {
          if (time >= 0) {
            this.setState({
              countDown: time--
            })
          } else {
            this.setState({
              codeBtnText: '重新发送',
              codeBtnDis: false,
              countDown: null,
            })
            clearInterval(timer)
            timer = null
          }
        }, 1000)
      }
    }
  }

  render() {
    const {       
      username = '',
      password = '',
      email = '',
      code = '', 
      spinner,
      spinnerText,
      codeSending,
    } = this.state
    const submitBtnDis = !username.trim() || !password.trim() || !email.trim() || !code.trim()

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
          rightButton={{
            name: '登录',
            routeName: 'Login'
          }}
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
        <TextInput
          onChangeText={(email) => this.setState({email})}
          value={this.state.email}
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
          placeholder="邮箱"
          placeholderTextColor="#cccccc"
          allowFontScaling={false}
          autoCapitalize="none"
          textContentType="emailAddress"
          keyboardType="email-address"
          visible-password='email-address'
        />
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 10
        }}>
          <TextInput
            onChangeText={(code) => this.setState({code})}
            value={this.state.code}
            style={{
              flex: 1,
              borderColor: '#cccccc', 
              borderWidth: 1,
              height: 36,
              paddingTop: 3,
              paddingHorizontal: 7,
              paddingBottom: 4,
              borderRadius: 3,
            }}
            placeholder="请输入验证码..."
            placeholderTextColor="#cccccc"
            allowFontScaling={false}
            autoCapitalize="none"
            keyboardType='numeric'
            returnKeyType='send'
          />
          <TouchableOpacity 
            activeOpacity={this.state.codeBtnDis || !email.trim() ? 1 : 0.6}
            onPress={this.state.codeBtnDis || !email.trim() ? null : this.sendCode}
            style={[
              globalStyles.button, 
              this.state.codeBtnDis 
                || !email.trim() 
                ? globalStyles.buttonDis 
                : null, {
              marginLeft: 10,
              flexDirection: 'row',
              alignItems: 'center'
            }]}
          >
            {codeSending ? <ActivityIndicator /> : null}
            {this.state.countDown !== null ? (
              <Text style={[globalStyles.buttonText, 
                this.state.codeBtnDis 
                  || !email.trim() 
                  ? globalStyles.buttonDisText 
                  : null, 
                {
                  marginRight: 10,
                }
              ]}>
                {this.state.countDown}
              </Text>
            ) : null}
            <Text style={[
              globalStyles.buttonText, 
              this.state.codeBtnDis 
                || !email.trim() 
                ? globalStyles.buttonDisText 
                : null]}>
              {this.state.codeBtnText}
            </Text>
          </TouchableOpacity>
        </View>
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
          >注册</Text>
        </TouchableOpacity>
      </View>
    )
  }
}
