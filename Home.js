import React, { Component } from 'react'
import {
  StyleSheet, 
  TouchableOpacity,
  Text, 
  View
} from 'react-native'
import { connect } from 'react-redux'
import Tab from './Tab'
import globalStyles from './globalStyles'
import TYicon from './TYicon'

class Home extends Component {
  static router = Tab.router;

  static navigationOptions = {
    drawerLabel: '首页'
  }

  render() {
    let { appName, slogan } = this.props.homeData

    return (
      <View style={styles.container}>
        <View style={ styles.header }>
          <Text style={styles.logo}>{ appName }</Text>
          <Text style={styles.slogan}>{ slogan }</Text>
          <TouchableOpacity
            onPress={() => this.props.navigation.openDrawer()}>
            <TYicon name='caidan' size={24} color='#333333'></TYicon>
          </TouchableOpacity>
        </View>
        <View style={globalStyles.headerBottomLine}></View>
        <Tab navigation={this.props.navigation} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 42,
    paddingTop: 3,
    paddingBottom: 4,
    paddingLeft: 7,
    paddingRight: 7
  },
  logo: {
    fontSize: 20,
    textAlign: 'center',
    color: 'red'
  },
  slogan: {
    textAlign: 'center',
    color: 'orange'
  },
})

const mapStateToProps = (state) => {
  const { homeData } = state
  return { homeData }
}

export default connect(mapStateToProps)(Home)
