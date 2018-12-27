import { Platform } from 'react-native'
import Toast from 'react-native-toast-native'

let style = {
  backgroundColor: "#000000",
  // width: 100,
  height: Platform.OS === ("ios") ? 36 : 64,
  color: "#ffffff",
  fontSize: 14,
  lineHeight: 2,
  lines: 4,
  borderRadius: 3,
  // fontWeight: "bold"
}

export function toast(msg) {
  Toast.show(msg, Toast.SHORT, Toast.CENTER, style);
}
