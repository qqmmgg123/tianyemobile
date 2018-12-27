import React from 'react'
import { Provider } from 'react-redux'
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text
} from 'react-native'
import { 
  createAppContainer, 
  createStackNavigator,
  createDrawerNavigator,
  DrawerItems, 
  SafeAreaView
} from 'react-navigation'
import { get, getUserInfo, removeUser, setCurRoute, getCurRoute, removeCurRoute } from './request'
import Home from './Home'
import Friend from './Friend'
import Login from './Login'
import HelpEditor from './HelpEditor'
import HelpDetail from './HelpDetail'
import ShareEditor from './ShareEditor'
import ShareDetail from './ShareDetail'
import ClassicDetail from './ClassicDetail'
import DiaryList from './DiaryList'
import NavigatorService from './services/navigator'
import { store } from './Store'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { changeLoginState } from './HomeActions';

class DrawerList extends React.Component {

  async postLogout() {
    let res = await get('logout')
    if (res.success) {
      this.props.navigation.closeDrawer()
      let curRoute = getCurRoute()
      if (curRoute) {
        this.props.navigation.navigate('Classic')
      }
      this.props.changeLoginState({
        need_login: true,
        userId: ''
      })
      await removeUser()
    }
  }

  render() {
    let { need_login } = this.props.loginData

    return (
      <View>
        <ScrollView>
          <DrawerItems
            {...this.props}
            getLabel = {(scene) => {
              if (scene.route.key !== 'Login' || need_login) {
                return (<Text 
                  style={{
                    height: 36,
                    lineHeight: 36,
                    paddingHorizontal: 10
                  }}>{this.props.getLabel(scene)}</Text>)
              } else {
                return null
              }
            }}
          />
          </ScrollView>
          {!need_login
            ? (<TouchableOpacity
                onPress={this.postLogout.bind(this)}
              >
                <Text 
                  style={{ 
                    height: 36,
                    lineHeight: 36,
                    paddingHorizontal: 10
                  }}>登出</Text>
              </TouchableOpacity>)
            : null}
        </View>
      )
  }
}

const mapStateToProps = (state) => {
  const { loginData } = state
  return { loginData }
}

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    changeLoginState,
  }, dispatch)
)

const DrawerComponent =  connect(mapStateToProps, mapDispatchToProps)(DrawerList)

const AppDrawerNavigator = createDrawerNavigator({
  Home: {
    screen: Home,
  },
  Friend: {
    screen: Friend,
  },
  Login: {
    screen: Login,
  }
}, {
  contentComponent: DrawerComponent
})

const DrawerContainer = createAppContainer(AppDrawerNavigator)

const AppNav = createStackNavigator({
  DrawerList: DrawerContainer,
  ClassicDetail,
  ShareDetail,
  HelpDetail,
  HelpEditor,
  ShareEditor,
  DiaryList,
}, {
  headerMode: 'none',
})

const defaultGetStateForAction = AppNav.router.getStateForAction;

AppNav.router.getStateForAction = (action, state) => {
  if (action.type === 'Navigation/NAVIGATE' && action.routeName) {
    console.log(action.type, action.routeName)
    if (action.routeName !== 'Login') {
      setCurRoute(action.routeName)
    }
    switch (action.routeName) {
      case 'Diary':
      case 'Help':
      case 'Friend':
        let userInfo = getUserInfo()
        if (!userInfo) {
          NavigatorService.navigate('Login')
          return null
        }
        break
      default:
        break
    }
  }
  return defaultGetStateForAction(action, state);
}

const AppContainer = createAppContainer(AppNav)

export default class App extends React.Component {

  render() {
    return (
      <Provider store={ store }>
        <SafeAreaView 
          style={{flex: 1, backgroundColor: '#fff'}} 
          forceInset={{ top: 'always', horizontal: 'never' }}
        >
          <AppContainer 
            ref={nav => {
              NavigatorService.setContainer(nav);
            }}
          />
        </SafeAreaView>
      </Provider>
    )
  }
}
