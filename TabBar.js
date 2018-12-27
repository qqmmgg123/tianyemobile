import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { connect } from 'react-redux'

const { width } = Dimensions.get('window');

class TabBar extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      curTab: 'CLASSIC'
    }
  }

  onPressTab(feature) {
    const { navigation } = this.props
    this.setState({
      curTab: feature
    })
    feature = feature.toLowerCase()
    let featureStr = feature.charAt(0).toUpperCase() + feature.slice(1)
    navigation.navigate(featureStr)
  }

  render() {
    let { features } = this.props.homeData

    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        width,
        height: 54,
        borderStyle: 'solid',
        borderTopColor: '#cccccc',
        borderTopWidth: 1
      }}>
      {(features? Object.entries(features) : []).map(feature => (
        <TouchableOpacity
         key={feature[0]}
         style={{ 
           height: 54,
           flex: 1
         }}
         onPress={this.onPressTab.bind(this, feature[0])}
        >
          <Text 
            style={{ 
              textAlign: 'center',
              lineHeight: 54,
              color: this.state.curTab === feature[0] ? 'red' : null
            }}
          >{feature[1]}</Text>
        </TouchableOpacity>
      ))}
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  const { homeData } = state
  return { homeData }
}

export default connect(mapStateToProps)(TabBar)
