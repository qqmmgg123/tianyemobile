import { StyleSheet } from 'react-native'
import { HEADER_HEIGHT } from 'app/component/Const'

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: HEADER_HEIGHT,
    paddingLeft: 10,
    backgroundColor: '#fafafa'
  },
  logo: {
    fontSize: 16,
    textAlign: 'center',
    color: '#EE3D80'
  },
  slogan: {
    textAlign: 'center',
    color: 'orange'
  },
  separator: {
    flex: 1,
    height: 5,
    backgroundColor: '#fafafa',
  },
  headerBottomLine: {
    height: 1,
    backgroundColor: '#cccccc',
  },
  splitLine: {
    height: 5,
    backgroundColor: '#fafafa',
  },
  inputText: {
    width: '80%',
    height: 48,
    padding: 10,
    marginTop: 10,
    fontSize: 16,
    borderBottomColor: '#ccc', 
    borderBottomWidth: 1,
  },
  inputPasswordField: {
    width: '80%',
    flexDirection: 'row',
    borderBottomColor: '#ccc', 
    borderBottomWidth: 1,
    marginTop: 10,
    alignItems: 'center',
  },
  inputPassword: {
    height: 48,
    padding: 10,
    flex: 1,
    fontSize: 16
  },
  button: {
    borderColor: '#dddddd', 
    borderWidth: 1, 
    borderRadius: 3,
    justifyContent: 'center',
    //height: 36,
    padding: 10,
    backgroundColor: '#fff'
  },
  buttonDis: {
    borderColor: '#eee', 
  },
  buttonText: {
    alignItems: 'center', 
    color: '#666666', 
    textAlign: 'center'
  },
  buttonDisText: {
    color: '#adadad',
  },
  noDataText: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    width: '60%',
    alignSelf: 'center',
    lineHeight: 28,
    padding: 10
  },
  quoteBg: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    padding: 10,
    marginTop: 10,
  },
  quoteTitle: {
    color: '#333',
    fontSize: 14,
    lineHeight: 24,
  },
  quoteSummary: {
    color: '#666',
    fontSize: 14,
    lineHeight: 22,
  },
  dropDown: {
    width: 150,
    backgroundColor: '#fff',
    padding: 10,
    position: 'absolute',
    right: 10,
    top: 42,
    padding: 10,
    zIndex: 999,
  }
})