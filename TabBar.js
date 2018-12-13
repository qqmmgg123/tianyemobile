import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { connect } from 'react-redux'

const { width } = Dimensions.get('window');

class TabBar extends React.Component {

  // 添加
  onPressClassic() {
    const { navigation } = this.props
    navigation.navigate('Classic')
  }

  // 浏览
  onPressShare(feature) {
    const { navigation } = this.props
    feature = feature.toLowerCase()
    let featureStr = feature.charAt(0).toUpperCase() + feature.slice(1)
    console.log(featureStr)
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
         style={{ flex: 1 }}
         onPress={this.onPressShare.bind(this, feature[0])}
        >
          <Text style={{ textAlign: 'center' }}>{feature[1]}</Text>
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
