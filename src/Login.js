/**
 * 用户登录界面
 */
import React, { Component } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native'
import { connect } from 'react-redux'
import { toast } from 'app/Toast'
import { Spinner } from 'app/component/GlobalModal'
import { STATUS_BAR_HEIGHT, BASE_COLOR } from 'app/component/Const'
import { post, getCurRoute } from 'app/component/request'
import globalStyles from 'app/component/globalStyles'
import TYicon from 'app/component/TYicon'
import Back from 'app/component/Back'

class Login extends Component {

  constructor(props) {
    super(props)
    this.state = { 
      email: '',
      password: '',
      code: '',
      codeSending: false,
      spinner: false,
      spinnerText: '',
      codeBtnDis: false,
      codeBtnText: '发送验证码',
      countDown: null,
      isSecret: true,
      way: 'local'
    }
    this._title = props.navigation.getParam('name')
  }

  async postLogin() {
    const { email, way, password, code } = this.state
    this.setState({
      spinner: true,
      spinnerText: '',
    })
    try {
      let params = {
        email,
        way
      }
      switch(way) {
        case 'local':
          params.password = password
          break
        case 'code':
          params.code = code
          break
      }
      let res = await post('login', params)
      this.setState({
        spinner: false,
        spinnerText: '',
      }, () => {
        if (res) {
          const { success } = res
          if (success) {
            console.log(`%c 用户登陆成功!!!`, 'color: red;font-size: 16px;')
            let curRoute = getCurRoute()
            console.log(`%c 跳转到route ${curRoute}`, 'color: red;font-size: 18px;')
            if (curRoute) {
              this.props.navigation.navigate(curRoute)
            }
          }
        }
      })
    } catch (err) {
      this.setState({
        spinner: false,
        spinnerText: '',
      })
    }
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
          type: 'login'
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
    let { loginData, navigation } = this.props
    let { need_login } = loginData
    let { 
      way,
      email = '', 
      password = '', 
      code = '',
      spinner, 
      spinnerText, 
      codeSending,
      isSecret, 
      currInput = '',
    } = this.state
    const submitBtnDis = !email.trim() || !(way === 'local' ? password : code.trim())

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
          name={this._title}
          navigation={this.props.navigation}
          rightButton={need_login ? {
            name: '注册',
            routeName: 'Signup'
          } : null}
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
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: '20%',
              paddingHorizontal: 10
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <Image
              source={require('./img/logo.png')}
              style={{
                width: 60,
                height: 60,
                backgroundColor: BASE_COLOR.BACKGROUND,
                borderRadius: 5,
                resizeMode: "center"
              }}
            />
            <TextInput
              style={globalStyles.inputText}
              onChangeText={(email) => this.setState({email})}
              value={this.state.email}
              placeholder="邮箱"
              placeholderTextColor="#ccc"
              allowFontScaling={false}
              autoCapitalize="none"
              textContentType="emailAddress"
              keyboardType="email-address"
              visible-password='email-address'
            />
            {
              way === 'local'
                ?  
                  <View 
                    style={globalStyles.inputPasswordField}
                  >
                    <TextInput
                      style={globalStyles.inputPassword}
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
                      color={isSecret ? '#cccccc' : '#333333'}
                    >
                    </TYicon>
                  </View>
                : <View 
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
            }
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
              >登录</Text>
            </TouchableOpacity>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
              width: '80%'
            }}>
              <TouchableOpacity
                style={{
                  padding: 10
                }}
                onPress={() => {
                  let newWay = way === 'local' ? 'code' : 'local'
                  this.setState({
                    way: newWay
                  })
                }}
              >
                <Text
                  style={{
                    color: '#999'
                  }}
                >{way === 'local' ? '邮箱验证码登录' : '密码登录'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  padding: 10
                }}
                onPress={() => navigation.navigate('Forgot')}
              >
                <Text
                  style={{
                    color: '#999'
                  }}
                >忘记密码</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  const { loginData } = state
  return { loginData }
}

export default connect(mapStateToProps)(Login)
