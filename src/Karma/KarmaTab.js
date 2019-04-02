import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'

class KarmaTab extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { 
      onTabPress,
      navigationState, 
      getLabelText, 
      getAccessibilityLabel,
      homeData
    } = this.props
    const { message = [] } = homeData
    const { index, routes } = navigationState
    const karmaMsg = message.find(msg => msg.feature === 'karma')
    const karmaMsgs = karmaMsg && karmaMsg.sub_feature || []

    return <View style={{
      flexDirection: 'row',
      backgroundColor: 'white'
    }}>
      {routes.map((route, routeIndex)=> {
        const isRouteActive = routeIndex === index
        const currentFeature = route.key.toLowerCase()
        const has_new = karmaMsgs.some(msg => {
          const isThereNew = msg.feature 
            === currentFeature 
            && msg.has_new
          return isThereNew
        })
        return <TouchableOpacity 
          key={route.key} 
          style={{
            flex: 1,
            paddingVertical: 20
          }}
          accessibilityLabel={getAccessibilityLabel({ route })}
          onPress={() => {
            onTabPress({ route })
          }}
        >
          {
            has_new 
              ?
                <View 
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'red',
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    marginTop: 10,
                    marginLeft: 10,
                    zIndex: 998,
                  }}
                >
                </View> 
              : null
          }
          <Text 
            style={{
              textAlign: 'center',
              color: isRouteActive ? '#EE3D80' : '#333'
            }}
          >{getLabelText({ route })}</Text>
        </TouchableOpacity>
      })}
    </View>
  }
}

const mapStateToProps = (state) => {
  const { homeData} = state
  return { homeData }
}

export default connect(mapStateToProps)(KarmaTab)
