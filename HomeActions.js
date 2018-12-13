import { 
  HOME_DATA_LOADED 
} from './types'

export const layoutHomeData = homeData => (
  {
    type: HOME_DATA_LOADED,
    homeData,
  }
)