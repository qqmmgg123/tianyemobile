import React from 'react'
import {
  View,
  TouchableOpacity,
  Text,
} from 'react-native'
import TYicon from 'app/component/TYicon'
import { connect } from 'react-redux'
import globalStyles from 'app/component/globalStyles'

let routes = [
  {
    key: 'Found',
    label: '随缘',
  },
  {
    key: 'Fate',
    label: '投缘',
  },
  {
    key: 'Friend',
    params: {
      routeName: 'Karma'
    },
    label: '有缘人',
  },
  {
    key: 'Talk',
    label: '谈心',
  },
]

class MoreList extends React.Component {

  render() {
    const { features, message = [] } = this.props.homeData
    const { routeName } = this.props.navigation.state
    const title = features && features[routeName.toUpperCase()] || ''

    return (
      <View
        style={globalStyles.container}
      >
        <View style={globalStyles.header}>
          <Text style={globalStyles.logo}>{ title }</Text>
        </View>
        <View style={globalStyles.headerBottomLine}></View>
        {routes.map(scene => {
          let curFeature = scene.key
          let { has_new = false } = message.find(
            msg => msg.sub_feature === curFeature.toLowerCase()
          ) || {}
          return (
            <View
              key={scene.key}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 20
                }}
                onPress={() => this.props.navigation.navigate(scene.key, scene.params || null)}
              >
                <Text 
                  style={{
                    flex: 1,
                    fontSize: 16
                  }}
                >{scene.label}</Text>
                {has_new ? <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'red',
                  marginRight: 15,
                }}></View> : null}
                <TYicon 
                  style={{
                    transform: [{ rotate: '180deg'}],
                    marginBottom: 2
                  }}
                  ref={ref => this._buttonText = ref} 
                  name='fanhui' 
                  size={16} 
                  color='#ccc'></TYicon>
              </TouchableOpacity>
              <View style={globalStyles.splitLine}></View>
            </View>
          )})}
        </View>
      )
  }
}

const mapStateToProps = (state) => {
  const { homeData} = state
  return { homeData }
}

export default connect(mapStateToProps)(MoreList)
