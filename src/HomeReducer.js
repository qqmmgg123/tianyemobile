import { combineReducers } from 'redux'
import { 
  HOME_DATA_LOADED,
  NEED_LOGIN
} from 'app/types'

const homeReducer = (state = {
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
  userId: 'aaaa',
  username: '',
  panname: '',
  email: ''
}, action) => {
  switch (action.type) {
    case NEED_LOGIN:
      return Object.assign({}, state, action.loginData)
    default:
      return state
  }
}

export default combineReducers({
  homeData: homeReducer,
  loginData: loginReducer
})
