/**
 * 常量集中定义
 */
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

export const { height: W_HEIGHT, width: W_WIDTH } = Dimensions.get('window')

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

export const BASE_COLOR = {
  BACKGROUND: '#FAFAFA',
  CHERRY_RED: '#EE3D80'
}

export const PERM_TYPES = {
  all: {
    name: '所有人',
  },
  friend: { 
    name: '有缘人',
  },
  me: { 
    name: '自己',
  }
}

export const MIND_TYPES = {
  share: {
    icon: ' : ) ',
    name: '感悟',
    action: '分享',
    description: '分享人生感悟，善意的忠告，或抚慰心灵的鸡汤。',
    permission: '分享给{name}'
  },
  help: { 
    icon: ' : ( ',
    name: '烦恼',
    action: '诉说',
    description: '诉说内心的疑惑、纠结、烦恼或苦闷。',
    permission: '向{name}诉说'
  },
  diary: {
    icon: ' : o ',
    name: '心事',
    action: '记录',
    description: '记录您内心的声音和念想(仅自己可见)。'
  }
}

// 情感操作类型
export const EMOTION = {
  help: {
    good: {
      name: '理解',
      id: 'understand'
    },
    bad: '无感'
  },
  share: {
    good: {
      name: '认同',
      id: 'thank'
    },
    bad: '无感'
  },
}

export const EMOTIONS = {
  thank: '认同',
  understand: '理解',
  text: '回复'
}
