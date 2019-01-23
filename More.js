import React from 'react'
import {
  View,
  TouchableOpacity,
  TextInput,
  Text,
  StyleSheet,
  KeyboardAvoidingView
} from 'react-native'
import TYicon from './TYicon'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Spinner from 'react-native-loading-spinner-overlay'
import { changeLoginState } from './HomeActions'
import { get, post, removeUser, getCurRoute, getUserInfo, updateUser } from './request'
import globalStyles from './globalStyles'
import { createFriendModal } from './GlobalModal'
import { toast } from './Toast'

let routes = [
  {
    key: 'Friend',
    params: {
      routeName: 'More'
    },
    label: '知己',
    visible: 'login'
  },
  {
    key: 'Signup',
    label: '注册',
    visible: 'unlogin'
  },
  {
    key: 'Login',
    label: '登录',
    visible: 'unlogin'
  },
  {
    key: 'Login',
    label: '切换账号',
    visible: 'login'
  },
]

class NameModify extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      panname: '',
      spinner: false,
      spinnerText: ''
    }
  }

  confirm = async () => {
    let { panname } = this.state
    panname = panname.trim()
    if (!panname) {
      toast('笔名不能填空。')
      return
    }
    this.setState({
      spinner: true,
      spinnerText: '',
    })
    const res = await post('panname', {
      panname
    })
    this.setState({
      spinner: false,
      spinnerText: '',
    })
    if (res.success) {
      let userInfo = getUserInfo()
      userInfo.panname = panname
      this.props.changeLoginState({
        panname
      })
      updateUser(userInfo)
      this.props.modal.close()
    }
  }

  render() {
    const { panname = '', spinner, spinnerText } = this.state

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
            onChangeText={(panname) => this.setState({panname})}
            value={this.state.panname}
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
            placeholder='新的笔名...'
            placeholderTextColor="#cccccc"
            allowFontScaling={false}
            autoCapitalize="none"
            autoFocus={true}
          />
          <TouchableOpacity
            onPress={!panname.trim() ? null : this.confirm}
            style={[
              globalStyles.button, 
              !panname.trim() ? globalStyles.buttonDis : null, 
              { 
                marginTop: 10,
              }
            ]}
          >
            <Text
              style={[
                globalStyles.buttonText, 
                !panname.trim() ? globalStyles.buttonDisText : null
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
      let curRoute = getCurRoute()
      if (curRoute) {
        this.props.navigation.navigate('Classic')
      }
      this.props.changeLoginState({
        need_login: true,
        userId: '',
        username: '',
        panname: '',
        email: ''
      })
      await removeUser()
    }
  }

  render() {
    let { loginData } = this.props
    let { need_login, username, panname, email } = loginData
    let userInfos = [
      { key: 'username', name: '用户名', value: username },
      { key: 'panname', name: '笔名', value: panname },
      { key: 'email', name: '邮箱', value: email },
    ]

    return (
      <View
        style={styles.container}
      >
        <View style={styles.header}>
          {/*<TYicon name='ellipsis' size={20} color='#FF0140'></TYicon>*/}
          <Text style={styles.logo}>其他</Text>
        </View>
        <View style={globalStyles.headerBottomLine}></View>
        {userInfos.map((info, index) => (
          info.value ? (<View key={index}>
            <TouchableOpacity
              activeOpacity={info.key === 'panname' ? 0 : 1}
              onPress={info.key === 'panname'
                ? () => this._modal.open()
                : null}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'nowrap',
                padding: 20
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
              {info.key === 'panname' ? (<TYicon 
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
                  padding: 20
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 42,
    paddingLeft: 10
  },
  logo: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FF0140'
  },
  slogan: {
    textAlign: 'center',
    color: 'orange'
  },
})

const mapStateToProps = (state) => {
  const { loginData } = state
  return { loginData }
}

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    changeLoginState,
  }, dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(MoreList)
