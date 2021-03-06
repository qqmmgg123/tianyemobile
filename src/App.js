/*
 * app主程序
 */
import SplashScreen from 'react-native-splash-screen'
import React from 'react'
import { Provider } from 'react-redux'
import { 
  AppState, 
  AsyncStorage, 
  NativeModules, 
  Platform,
} from 'react-native'
import { 
  createAppContainer, 
  createStackNavigator,
  SafeAreaView
} from 'react-navigation'
import { 
  getUserByMemory, 
  setCurRoute, 
  setCookieByMemory, 
  setUserByMemory 
} from 'app/component/request'
import { getNotification } from 'app/component/api'
import { layoutHomeData, changeLoginState } from 'app/HomeActions'
import Tab from 'app/Tab'
import Profile from 'app/Profile'
import HelpDetail from 'app/HelpDetail'
import HelpSelect from 'app/HelpSelect'
import AcceptPrompt from 'app/Friend/AcceptPrompt'
import QuoteEditor from 'app/QuoteEditor'
import MindEditor from 'app/Mind/MindEditor'
import EarthItem from 'app/Earth/EarthItem'
import ClassicDetail from 'app/Classic/ClassicDetail'
import ClassicSection from 'app/Classic/ClassicSection'
import ClassicTranslate from 'app/Classic/ClassicTranslate'
import ClassicTranslates from 'app/Classic/ClassicTranslates'
import UserSearch from 'app/Friend/UserSearch'
import Login from 'app/Login'
import Signup from 'app/Signup'
import Password from 'app/Password'
import Forgot from 'app/Forgot'
import NavigatorService from 'app/services/navigator'
import { store } from 'app/Store'
import StackViewStyleInterpolator from 'react-navigation-stack/dist/views/StackView/StackViewStyleInterpolator'

const modalNav = createStackNavigator({
  Tab,
  MindEditor,
  QuoteEditor,
  UserSearch,
  AcceptPrompt
}, {
  headerMode: 'none',
  mode: 'modal',
  cardStyle: { backgroundColor: '#fafafa' },
})

const AppNav = createStackNavigator({
  modalNav,
  Profile,
  ClassicDetail,
  ClassicSection,
  ClassicTranslate,
  ClassicTranslates,
  HelpDetail,
  HelpSelect,
  EarthItem,
  Login,
  Signup,
  Password,
  Forgot
}, {
  headerMode: 'none',
  mode: 'card',
  // cardStyle: { backgroundColor: '#fafafa' },
  transitionConfig: () => ({
    screenInterpolator: sceneProps => {
      return StackViewStyleInterpolator.forHorizontal(sceneProps);
    }
  }),
})

const defaultGetStateForAction = AppNav.router.getStateForAction;

AppNav.router.getStateForAction = (action, state) => {
  if (action.type === 'Navigation/NAVIGATE' && action.routeName) {
    console.log(action.routeName)
    if (['Login', 'Signup', 'Forgot'].indexOf(action.routeName) === -1) {
      setCurRoute(action.routeName)
    } else {
      setCurRoute('Mind')
    }
    switch (action.routeName) {
      case 'Mind':
      case 'Karma':
        let userInfo = getUserByMemory()
        if (!userInfo) {
          NavigatorService.navigate('Login', {
            name: '登录'
          })
          return null
        }
        break
      default:
        break
    }
  }
  return defaultGetStateForAction(action, state)
}

const AppContainer = createAppContainer(AppNav)

export default class App extends React.Component {

  constructor(props) {
    super(props)
  }

  state = {
    appState: AppState.currentState
  }

  async componentWillMount() {
    Platform.OS === 'android' && NativeModules.UpdateApp.updateDialog()
    // 获取登陆信息
    const keys = await AsyncStorage.getAllKeys()
    const stores = await AsyncStorage.multiGet(keys)
    stores.map((result, i, storage) => {
      let key = storage[i][0]
      let value = storage[i][1]
      switch(key) {
        case 'cookie':
          if (value) {
            setCookieByMemory(value)
          }
          break
        case 'user':
          if (value) {
            setUserByMemory(value)
            let user = JSON.parse(value)
            store.dispatch(changeLoginState({
              need_login: false,
              userId: user._id,
              nickname: user.nickname,
              email: user.email
            }))
          }
          break
      }
    })
    // 获取通知
    const notification = await getNotification()
    store.dispatch(layoutHomeData({ 
      launch: true,
      message: notification
    }))
    SplashScreen.hide()
  }

  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // 获取通知
      getNotification().then((notification) => {
        store.dispatch(layoutHomeData({ message: notification }))
      })
    }
    this.setState({appState: nextAppState});
  }

  render() {
    return (
      <Provider store={ store }>
        <SafeAreaView 
          style={{flex: 1, backgroundColor: '#fafafa'}} 
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
