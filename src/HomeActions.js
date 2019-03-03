import { 
  HOME_DATA_LOADED,
  NEED_LOGIN
} from 'app/types'

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
