/**
 * 用户注册界面
 */
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
import { Spinner } from 'app/component/GlobalModal'
import { STATUS_BAR_HEIGHT } from 'app/component/Const'

export default class Signup extends Component {

  constructor(props) {
    super(props)
    this.state = { 
      nickname: '',
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

  // 发起注册请求
  postSignup() {
    const { 
      nickname, 
      password, 
      email, 
      code 
    } = this.state
    this.setState({
      spinner: true,
      spinnerText: '',
      submitBtnDis: true
    }, async () => {
      try {
        await post('signup', {
          nickname,
          password,
          email,
          code,
        })
        let curRoute = getCurRoute()
        if (curRoute) {
          this.props.navigation.navigate(curRoute)
        }
      } catch (err) {
        this.setState({
          spinner: false,
          spinnerText: '',
          submitBtnDis: false
        })
      }
    })
  }

  // 发送验证码
  sendCode = () => {
    const { email } = this.state
    this.setState({
      codeSending: true
    }, async () => {
      try {
        await post('email/vcode', {
          email,
          type: 'signup'
        })
        toast('验证码发送成功，有效时间10分钟。')
        let timer = null
        let time = 60
        this.setState({
          codeBtnText: '秒后可重发',
          codeBtnDis: true,
          codeSending: false
        }, () => {
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
        })
      } catch (err) {
        this.setState({
          codeBtnText: '重新发送',
          codeBtnDis: false,
          codeSending: false
        })
      }
    })
  }

  render() {
    const {       
      nickname = '',
      password = '',
      email = '',
      code = '', 
      spinner,
      spinnerText,
      codeSending,
      isSecret,
    } = this.state
    const submitBtnDis = !nickname.trim() || !password.trim() || !email.trim() || !code.trim()

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
              onChangeText={(nickname) => this.setState({nickname})}
              value={this.state.nickname}
              placeholder="称号"
              placeholderTextColor="#cccccc"
              allowFontScaling={false}
              autoCapitalize="none"
              textContentType="nickname"
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
                activeOpacity={this.state.codeBtnDis || !email.trim() || codeSending ? 1 : 0.6}
                onPress={this.state.codeBtnDis || !email.trim() || codeSending ? null : this.sendCode}
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
                : this.postSignup.bind(this)}
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
