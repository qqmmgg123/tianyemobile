import { combineReducers } from 'redux'
import { 
  HOME_DATA_LOADED,
  NEED_LOGIN
} from './types'

const homeReducer = (state = {
  homeData: {
    appName: '',
    slogan: '',
    features: null,
  }
}, action) => {
  console.log(action)
  switch (action.type) {
    case HOME_DATA_LOADED:
      return Object.assign({}, state.homeData, action.homeData)
    default:
      return state
  }
}

const loginReducer = (state = {
  loginData: {
    need_login: true,
    userId: '',
    username: '',
    panname: '',
    email: ''
  }
}, action) => {
  console.log(action)
  switch (action.type) {
    case NEED_LOGIN:
      return Object.assign({}, state.loginData, action.loginData)
    default:
      return state
  }
}

export default combineReducers({
  homeData: homeReducer,
  loginData: loginReducer
})
