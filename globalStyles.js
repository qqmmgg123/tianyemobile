import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  /*
   * Removed for brevity
   */
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#cccccc',
  },
  headerBottomLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#c4c4c4',
  },
  button: {
    // flex: 1,
    borderColor: '#dddddd', 
    borderWidth: 1, 
    borderRadius: 3,
    justifyContent: 'center',
    height: 36,
    paddingTop: 3,
    paddingHorizontal: 7,
    paddingBottom: 4,
    // marginTop: 10
  },
  buttonText: {
    alignItems: 'center', 
    color: '#666666', 
    textAlign: 'center'
  },
})