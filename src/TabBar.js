import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { connect } from 'react-redux'
import TYicon from 'app/component/TYicon'
import { TAB_HEIGHT } from 'app/component/Const'

const { width } = Dimensions.get('window');

class TabBar extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      curTab: 'CLASSIC'
    }
  }

  capitalize(str) {
    str = str.toLowerCase()
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  onPressTab(feature) {
    const { navigation } = this.props
    this.setState({
      curTab: feature
    })
    feature = this.capitalize(feature)
    navigation.navigate(feature)
  }

  render() {
    let { features, message = [] } = this.props.homeData
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        width,
        height: 54,
        backgroundColor: '#fafafa',
        // borderStyle: 'solid',
        // borderTopColor: '#cccccc',
        // borderTopWidth: 1,
      }}>
      {(features? Object.entries(features) : []).map(feature => {
        let curFeature = feature[0]
        let has_new = message.some(
          msg => msg.feature === curFeature.toLowerCase() && msg.has_new
        )
        return (
          <TouchableOpacity
          key={feature[0]}
          style={{ 
            height: 54,
            flex: 1,
          }}
          onPress={this.onPressTab.bind(this, feature[0])}
          >
            {has_new ? <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'red',
              position: 'absolute',
              left: '50%',
              top: '50%',
              marginLeft: 6,
              marginTop: -14,
              zIndex: 998,
              
            }}></View> : null}
            <Text 
              style={{ 
                textAlign: 'center',
                lineHeight: TAB_HEIGHT,
                color: this.state.curTab === feature[0] ? '#EE3D80' : null
              }}
            >{feature[1]}</Text>
          </TouchableOpacity>
        )
      })}
        <TouchableOpacity
          key='MORE'
          style={{ 
            height: TAB_HEIGHT,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onPress={this.onPressTab.bind(this, 'MORE')}
          >
          <TYicon name='ellipsis' size={16} color={this.state.curTab === 'MORE' ? '#EE3D80' : '#333'}></TYicon>
        </TouchableOpacity>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  const { homeData } = state
  return { homeData }
}

export default connect(mapStateToProps)(TabBar)
