import {
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';

// iPhoneX
const X_WIDTH = 375;
const X_HEIGHT = 812;

const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;

const { height: W_HEIGHT, width: W_WIDTH } = Dimensions.get('window')

let isIPhoneX = false;

if (Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS) {
    isIPhoneX = W_WIDTH === X_WIDTH && W_HEIGHT === X_HEIGHT || W_WIDTH === XSMAX_WIDTH && W_HEIGHT === XSMAX_HEIGHT;
}

export const HEADER_HEIGHT = 42
export const ANIMATION_DURATION = 250
export const TAB_HEIGHT = 54
export const STATUS_BAR_HEIGHT = Platform.select({
  ios: isIPhoneX ? 44 : 20,
  android: StatusBar.currentHeight,
  default: 0
})

export const MIND_TYPES = {
  share: {
    icon: ' : ) ',
    name: '感悟',
    action: '分享',
    description: '分享人生感悟，善意的忠告，或抚慰心灵的鸡汤。'
  },
  help: { 
    icon: ' : ( ',
    name: '烦恼',
    action: '诉说',
    description: '诉说内心的疑惑、纠结、烦恼或苦闷。'
  },
  diary: {
    icon: ' : o ',
    name: '心事',
    action: '记录',
    description: '记录您内心的声音和念想(仅自己可见)。'
  }
}
