import React from 'react'
import { Provider } from 'react-redux'
import { AppState } from 'react-native'
import { 
  createAppContainer, 
  createStackNavigator,
  SafeAreaView
} from 'react-navigation'
import { get, getUserInfo, setCurRoute } from 'app/component/request'
import { layoutHomeData } from 'app/HomeActions'
import Tab from 'app/Tab'
import Profile from 'app/Profile'
import Talk from 'app/Karma/Talk'
import Fate from 'app/Karma/Fate'
import Found from 'app/Karma/Found'
import HelpDetail from 'app/HelpDetail'
import HelpSelect from 'app/HelpSelect'
import QuoteEditor from 'app/QuoteEditor'
import MindDetail from 'app/Mind/MindDetail'
import ClassicDetail from 'app/Classic/ClassicDetail'
import ClassicSection from 'app/Classic/ClassicSection'
import ClassicTranslate from 'app/Classic/ClassicTranslate'
import ClassicTranslates from 'app/Classic/ClassicTranslates'
import Friend from 'app/Friend'
import Login from 'app/Login'
import Signup from 'app/Signup'
import NavigatorService from 'app/services/navigator'
import { store } from 'app/Store'
import StackViewStyleInterpolator from 'react-navigation-stack/dist/views/StackView/StackViewStyleInterpolator'

const modalNav = createStackNavigator({
  Tab,
  QuoteEditor
}, {
  headerMode: 'none',
  mode: 'modal'
})

const AppNav = createStackNavigator({
  modalNav,
  Profile,
  ClassicDetail,
  ClassicSection,
  ClassicTranslate,
  ClassicTranslates,
  Talk,
  Fate,
  Found,
  MindDetail,
  HelpDetail,
  HelpSelect,
  Friend,
  Login,
  Signup,
}, {
  headerMode: 'none',
  mode: 'card',
  transitionConfig: () => ({
    screenInterpolator: sceneProps => {
      return StackViewStyleInterpolator.forHorizontal(sceneProps);
    }
  }),
})

const defaultGetStateForAction = AppNav.router.getStateForAction;

AppNav.router.getStateForAction = (action, state) => {
  if (action.type === 'Navigation/NAVIGATE' && action.routeName) {
    console.log(action.type, action.routeName)
    if (action.routeName !== 'Login' && action.routeName !== 'Signup') {
      setCurRoute(action.routeName)
    }
    switch (action.routeName) {
      case 'Mind':
      case 'Karma':
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

  state = {
    appState: AppState.currentState,
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
      // 获取通知
      this.getNotification()
    }
    this.setState({appState: nextAppState});
  }

  async getNotification() {
    console.log('get notification....')
    let data = await get('notification')
    if (data) {
      let { success, notification } = data
      if (success) {
        console.log(notification, store.getState())
        let { homeData } = store.getState()
        store.dispatch(layoutHomeData(Object.assign(homeData, { message: notification })))
      }
    }
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
