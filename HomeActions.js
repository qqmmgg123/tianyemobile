import { 
  HOME_DATA_LOADED,
  NEED_LOGIN
} from './types'

export const layoutHomeData = homeData => (
  {
    type: HOME_DATA_LOADED,
    homeData
  }
)

export const changeLoginState = loginData => (
  {
    type: NEED_LOGIN,
    loginData
  }
)
