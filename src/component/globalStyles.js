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
    color: '#666666',
    textAlign: 'center',
    fontSize: 14,
    padding: 10
  },
  quoteBg: {
    //borderLeftColor: 'rgba(0, 0, 0, 0.1)',
    //borderLeftWidth: 2,
    //backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    padding: 10,
    marginTop: 10,
  },
  quoteTitle: {
    color: '#666',
    fontSize: 14,
    lineHeight: 24,
  },
  quoteSummary: {
    color: '#999',
    marginTop: 5,
    fontSize: 12,
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
  },
})