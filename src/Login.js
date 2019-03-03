import React, { Component } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native'
import { connect } from 'react-redux'
import Spinner from 'react-native-loading-spinner-overlay'
import globalStyles from 'app/component/globalStyles'
import { post, getCurRoute } from 'app/component/request'
import TYicon from 'app/component/TYicon'
import Back from 'app/component/Back'
import { STATUS_BAR_HEIGHT } from 'app/component/Const'

class Login extends Component {

  constructor(props) {
    super(props)
    this.state = { 
      username: '',
      password: '',
      spinner: false,
      spinnerText: '',
      isSecret: true
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
    let { 
      username = '', 
      password = '', 
      spinner, 
      spinnerText, 
      isSecret, 
      currInput = '',
    } = this.state
    const submitBtnDis = !username.trim() || !password.trim()

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
              placeholderTextColor="#ccc"
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
