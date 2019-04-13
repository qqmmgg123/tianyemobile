/**
 * 其他模块
 */
import React from 'react'
import {
  View,
  TouchableOpacity,
  TextInput,
  Text,
  StyleSheet,
  AsyncStorage,
  KeyboardAvoidingView
} from 'react-native'
import TYicon from 'app/component/TYicon'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Spinner from 'react-native-loading-spinner-overlay'
import { changeLoginState } from 'app/HomeActions'
import { 
  get, 
  post, 
  removeCookieByMemory, 
  removeUserByMemory, 
  getCurRoute, 
  getUserByMemory
} from 'app/component/request'
import globalStyles from 'app/component/globalStyles'
import { createFriendModal } from 'app/component/GlobalModal'
import { toast } from 'app/Toast'

let routes = [
  {
    key: 'Signup',
    label: '注册',
    visible: 'unlogin'
  },
  {
    key: 'Login',
    label: '登录',
    visible: 'unlogin',
    params: {
      name: '登录'
    }
  },
  {
    key: 'Login',
    label: '切换账号',
    visible: 'login',
    params: {
      name: '切换账号'
    }
  },
]

class NameModify extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      nickname: '',
      spinner: false,
      spinnerText: ''
    }
  }

  confirm = async () => {
    let { nickname } = this.state
    nickname = nickname.trim()
    if (!nickname) {
      toast('称号不能填空。')
      return
    }
    this.setState({
      spinner: true,
      spinnerText: '',
    })
    const res = await post('nickname', {
      nickname
    })
    this.setState({
      spinner: false,
      spinnerText: '',
    })
    if (res.success) {
      let userInfo = getUserByMemory()
      userInfo.nickname = nickname
      setUserByMemory(JSON.stringify(userInfo))
      AsyncStorage.setItem('user', JSON.stringify(userInfo))
      this.props.changeLoginState({
        nickname
      })
      this.props.modal.close()
    }
  }

  render() {
    const { nickname = '', spinner, spinnerText } = this.state

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior='height'
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
          <TextInput
            onChangeText={(nickname) => this.setState({nickname})}
            value={this.state.nickname}
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
            placeholder='新的称号...'
            placeholderTextColor="#cccccc"
            allowFontScaling={false}
            autoCapitalize="none"
            autoFocus={true}
          />
          <TouchableOpacity
            activeOpacity={!nickname.trim() ? 1 : 0.6}
            onPress={!nickname.trim() ? null : this.confirm}
            style={[
              globalStyles.button, 
              !nickname.trim() ? globalStyles.buttonDis : null, 
              { 
                marginTop: 10,
              }
            ]}
          >
            <Text
              style={[
                globalStyles.buttonText, 
                !nickname.trim() ? globalStyles.buttonDisText : null
              ]}
            >确定修改</Text>
          </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    )
  }

}

const NameModifyModal = createFriendModal({ NameModify })

class MoreList extends React.Component {

  async postLogout() {
    let res = await get('logout')
    if (res.success) {
      removeCookieByMemory()
      removeUserByMemory()
      AsyncStorage.multiRemove(['cookie', 'user'])
      this.props.changeLoginState({
        need_login: true,
        userId: '',
        userId: '',
        nickname: '',
        email: ''
      })
      let curRoute = getCurRoute()
      if (curRoute) {
        this.props.navigation.navigate('Earth')
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.homeData.launch || this.props.homeData.launch
  }

  render() {
    console.log('启动结束渲染......')
    let { loginData, navigation } = this.props
    let { need_login, nickname, email } = loginData
    let userInfos = [
      { key: 'nickname', name: '称号', value: nickname },
      { key: 'email', name: '邮箱', value: email },
      // { key: 'password', name: '密码' },
    ]

    return (
      <View
        style={globalStyles.container}
      >
        <View style={globalStyles.header}>
          {/*<TYicon name='ellipsis' size={20} color='#EE3D80'></TYicon>*/}
          <Text style={globalStyles.logo}>其他</Text>
        </View>
        {/*<View style={globalStyles.headerBottomLine}></View>*/}
        {userInfos.map((info, index) => (
          info.value ? (<View key={index}>
            <TouchableOpacity
              activeOpacity={info.key === 'nickname' ? 0 : 1}
              onPress={info.key === 'nickname'
                ? () => this._modal.open()
                : (info.key === 'password'
                ? () => {
                  // navigation.navigate('Password')
                }
                : null)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'nowrap',
                padding: 20,
                backgroundColor: 'white'
              }}
            >
              <Text 
                style={{
                  flex: 1
                }}
              >{info.name}</Text>
              <Text 
                style={{
                  maxWidth: '50%',
                  color: '#666'
                }}
                numberOfLines={1}
              >{info.value}</Text>
              {info.key === 'nickname' ? (<TYicon 
                style={{
                  transform: [{ rotate: '180deg'}],
                  marginBottom: 2
                }}
                ref={ref => this._buttonText = ref} 
                name='fanhui' 
                size={16} 
              color='#ccc'></TYicon>) : null}
            </TouchableOpacity>
            <View style={globalStyles.splitLine}></View>
        </View>) : null
        ))}
        {routes.map(scene => {
          return ((!need_login && scene.visible === 'login') 
            || (need_login && scene.visible === 'unlogin')
            || scene.visible === 'allways') 
            ? (
            <View
              key={scene.key}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 20,
                  backgroundColor: 'white'
                }}
                onPress={() => this.props.navigation.navigate(scene.key, scene.params || null)}
              >
                <Text 
                  style={{
                    flex: 1
                  }}
                >{scene.label}</Text>
                <TYicon 
                  style={{
                    transform: [{ rotate: '180deg'}],
                    marginBottom: 2
                  }}
                  ref={ref => this._buttonText = ref} 
                  name='fanhui' 
                  size={16} 
                  color='#ccc'></TYicon>
              </TouchableOpacity>
              <View style={globalStyles.splitLine}></View>
            </View>
          ) : null})}
        {!need_login
          ? (<View style={{
            padding: 15
          }}>
              <TouchableOpacity
                onPress={this.postLogout.bind(this)}
                style={Object.assign({}, globalStyles.button, {
                  height: 42
                })}
              >
                <Text style={globalStyles.buttonText}>登出账号</Text>
              </TouchableOpacity>
            </View>)
          : null}
          <NameModifyModal 
            ref={ref => this._modal = ref}
            changeLoginState={
              loginData => this.props.changeLoginState(
                Object.assign(this.props.loginData, loginData))}
          />
        </View>
      )
  }
}

const mapStateToProps = (state) => {
  const { loginData, homeData } = state
  return { loginData, homeData }
}

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    changeLoginState,
  }, dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(MoreList)
