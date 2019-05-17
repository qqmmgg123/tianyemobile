import { combineReducers } from 'redux'
import { 
  HOME_DATA_LOADED,
  NEED_LOGIN
} from 'app/types'

const homeReducer = (state = {
  launch: false,
  appName: '',
  slogan: '',
  features: null,
  message: [],
}, action) => {
  switch (action.type) {
    case HOME_DATA_LOADED:
      return Object.assign({}, state, action.homeData)
    default:
      return state
  }
}

const loginReducer = (state = {
  need_login: true,
  userId: '',
  nickname: '',
  email: ''
}, action) => {
  switch (action.type) {
    case NEED_LOGIN:
      return Object.assign({}, state, action.loginData)
    default:
      return state
  }
}

// TODO 用户操作变化通知
/* const userActionReducer = (state = {

}, action) => {
  switch (action.type) {
    default:
      return state
  }
} */

export default combineReducers({
  homeData: homeReducer,
  loginData: loginReducer
})
