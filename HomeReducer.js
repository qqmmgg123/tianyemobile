import { combineReducers } from 'redux'
import { 
  HOME_DATA_LOADED 
} from './types'

const INITIAL_STATE = {
  homeData: {
    appName: '',
    slogan: '',
    features: null
  }
}

const homeReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case HOME_DATA_LOADED:
      return Object.assign({}, state.homeData, action.homeData)
    default:
      return state
  }
}

export default combineReducers({
  homeData: homeReducer
})