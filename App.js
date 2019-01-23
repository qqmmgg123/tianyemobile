import React from 'react'
import { Provider } from 'react-redux'
import { 
  createAppContainer, 
  createStackNavigator,
  SafeAreaView
} from 'react-navigation'
import { getUserInfo, setCurRoute } from './request'
import Tab from './Tab'
import Profile from './Profile'
import HelpEditor from './HelpEditor'
import HelpDetail from './HelpDetail'
import HelpSelect from './HelpSelect'
import ShareEditor from './ShareEditor'
import ShareDetail from './ShareDetail'
import ClassicDetail from './ClassicDetail'
import ClassicSection from './ClassicSection'
import ClassicTranslate from './ClassicTranslate'
import ClassicTranslates from './ClassicTranslates'
import DiaryList from './DiaryList'
import Friend from './Friend'
import Login from './Login'
import Signup from './Signup'
import NavigatorService from './services/navigator'
import { store } from './Store'

const AppNav = createStackNavigator({
  Tab,
  Profile,
  ClassicDetail,
  ClassicSection,
  ClassicTranslate,
  ClassicTranslates,
  ShareDetail,
  HelpDetail,
  HelpEditor,
  HelpSelect,
  ShareEditor,
  DiaryList,
  Friend,
  Login,
  Signup,
}, {
  headerMode: 'none',
})

const defaultGetStateForAction = AppNav.router.getStateForAction;

AppNav.router.getStateForAction = (action, state) => {
  if (action.type === 'Navigation/NAVIGATE' && action.routeName) {
    console.log(action.type, action.routeName)
    if (action.routeName !== 'Login' && action.routeName !== 'Signup') {
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
