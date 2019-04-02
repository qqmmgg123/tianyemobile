import React from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  findNodeHandle
} from 'react-native'
import { createMaterialTopTabNavigator } from 'react-navigation'
import CardView from 'react-native-rn-cardview'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from 'app/HomeActions'
import { getNotification } from 'app/component/api'
import TYicon from 'app/component/TYicon'
import { connect } from 'react-redux'
import globalStyles from 'app/component/globalStyles'
import Talk from 'app/Karma/Talk'
import Friend from 'app/Friend'
import Fate from 'app/Karma/Fate'
import KarmaTab from 'app/Karma/KarmaTab'

let navOptions = {
  tabBarComponent: props => <KarmaTab {...props} />,
  tabBarOptions: {
    labelStyle: {
      color: '#333333'
    },
    indicatorStyle: {
      width: 20,
      left: '16.66%',
      marginLeft: -10,
      backgroundColor: '#EE3D80'
    },
    style: {
      backgroundColor: '#ffffff',
    }
  }
}

const FateNav = createMaterialTopTabNavigator({
  Talk,
  Friend,
  Fate
}, navOptions)

class Karma extends React.Component {

  constructor(props) {
    super(props)
  }

  static router = FateNav.router

  static navigationOptions = {
    cardStack: {
      gesturesEnabled: false
    }
  }

  friendChange = () => {
    this.props.navigation.state.routes.forEach((route => {
      if (['Talk', 'Fate'].indexOf(route.key) !== -1) {
        route.params.component.reload()
        getNotification().then(notification => {
          this.props.layoutHomeData({ 
            message: notification
          })
        })
      }
    }))
  }

  fateChange = () => {
    const friend  = this.props.navigation.state.routes.find(route => route.key === 'Friend')
    friend.params.component.reload()
  }

  render() {
    const { features } = this.props.homeData
    const { routeName } = this.props.navigation.state
    const title = features && features[routeName.toUpperCase()] || ''

    return (
      <View 
        style={[globalStyles.container, {
          zIndex: 0
        }]}
      >
        <View style={globalStyles.header}>
          <Text style={globalStyles.logo}>{ title }</Text>
          <TouchableOpacity
            style={{
              padding: 10
            }}
            onPress={() => {
              this.props.navigation.navigate('UserSearch', {
                onGoBack: () => this.refresh()
              })
            }}
          >
            <TYicon 
              style={{
                marginRight: 10
              }}
              name='mn_tianjiahaoyou' 
              size={18} 
              color='#666'></TYicon>
          </TouchableOpacity>
        </View>
        <FateNav
          navigation={this.props.navigation} 
          screenProps={{
            onFriendChange: this.friendChange,
            onFateChange: this.fateChange
          }}
        />
      </View>
    )
  } 
}

const mapStateToProps = (state) => {
  const { homeData} = state
  return { homeData }
}

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    layoutHomeData,
  }, dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(Karma)
