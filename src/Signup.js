import React, { Component } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native'
import { post, getCurRoute } from 'app/component/request'
import TYicon from 'app/component/TYicon'
import Back from 'app/component/Back'
import globalStyles from 'app/component/globalStyles'
import { toast } from 'app/Toast'
import Spinner from 'react-native-loading-spinner-overlay'
import { STATUS_BAR_HEIGHT } from 'app/component/Const'

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
      countDown: null,
      isSecret: true
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
      isSecret,
    } = this.state
    const submitBtnDis = !username.trim() || !password.trim() || !email.trim() || !code.trim()

    return (
      <View
        style={globalStyles.container}
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
        <KeyboardAvoidingView
          keyboardVerticalOffset={Platform.select({ios: STATUS_BAR_HEIGHT, android: null})}
          behavior={Platform.select({ios: 'padding', android: null})}
          style={{
            flex: 1,
          }}
        >
          <ScrollView 
            contentContainerStyle={{
              flex: 1,
              padding: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <TextInput
              style={{
                width: '80%',
                borderBottomColor: '#ccc', 
                borderBottomWidth: 1,
                height: 48,
                paddingTop: 3,
                paddingHorizontal: 7,
                paddingBottom: 4,
                marginTop: 10,
                fontSize: 16
              }}
              onChangeText={(username) => this.setState({username})}
              value={this.state.username}
              placeholder="用户名"
              placeholderTextColor="#cccccc"
              allowFontScaling={false}
              autoCapitalize="none"
              textContentType="username"
            />
            <View 
              style={{
                width: '80%',
                flexDirection: 'row',
                borderBottomColor: '#ccc', 
                borderBottomWidth: 1,
                borderRadius: 3,
                marginTop: 10,
                alignItems: 'center',
              }}
            >
              <TextInput
                style={{
                  height: 48,
                  paddingTop: 3,
                  paddingHorizontal: 7,
                  paddingBottom: 4,
                  flex: 1,
                  fontSize: 16
                }}
                placeholder="密码"
                placeholderTextColor="#cccccc"
                allowFontScaling={false}
                autoCapitalize="none"
                secureTextEntry={isSecret}
                textContentType="password"
                onChangeText={(password) => this.setState({password})}
                value={this.state.password}
              />
              <TYicon 
                style={{
                  marginRight: 10
                }}
                onPress={() => this.setState({
                  isSecret: !isSecret
                })}
                name={isSecret ? 'biyanjing' : 'yanjing'}
                size={24} 
                color='#333'></TYicon>
            </View>
            <TextInput
              style={{
                width: '80%',
                borderBottomColor: '#ccc', 
                borderBottomWidth: 1,
                height: 48,
                paddingTop: 3,
                paddingHorizontal: 7,
                paddingBottom: 4,
                marginTop: 10,
                fontSize: 16
              }}
              onChangeText={(email) => this.setState({email})}
              value={this.state.email}
              placeholder="邮箱"
              placeholderTextColor="#cccccc"
              allowFontScaling={false}
              autoCapitalize="none"
              textContentType="emailAddress"
              keyboardType="email-address"
              visible-password='email-address'
            />
            <View 
              style={{
                width: '80%',
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  borderBottomColor: '#ccc', 
                  borderBottomWidth: 1,
                  height: 48,
                  paddingTop: 3,
                  paddingHorizontal: 7,
                  paddingBottom: 4,
                  fontSize: 16
                }}
                onChangeText={(code) => this.setState({code})}
                value={this.state.code}
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
                  height: 48,
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
                  width: '80%',
                  marginTop: 10,
                  height: 48
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
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    )
  }
}
