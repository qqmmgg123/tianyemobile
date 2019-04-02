import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { connect } from 'react-redux'
import TYicon from 'app/component/TYicon'
import { TAB_HEIGHT } from 'app/component/Const'

const { width } = Dimensions.get('window');

class TabBar extends React.Component {

  constructor(props) {
    super(props)
  }

  capitalize(str) {
    str = str.toLowerCase()
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  onPressTab(feature) {
    const { navigation } = this.props
    feature = this.capitalize(feature)
    navigation.navigate(feature)
  }

  shouldComponentUpdate(nextProps) {
    const newRoute = nextProps
    .navigation
    .state.routes[
      nextProps
      .navigation
      .state
      .index
    ].routeName
    , currRoute = this
    .props
    .navigation
    .state.routes[
      this
      .props
      .navigation
      .state
      .index
    ].routeName 
    , newFeatures = nextProps.homeData.features
    , featureKeys = Object.keys(newFeatures || {})
    , featuresChanged = newFeatures !== this.props.homeData.features
    , routeChanged = newRoute !== currRoute
    , routeInfeatures = featureKeys.indexOf(newRoute.toUpperCase()) !== -1
    , messageChanged = nextProps.homeData.message !== this.props.homeData.message
    , hasLaunched = nextProps.homeData.launch || this.props.homeData.launch

    // 再次渲染的条件
    console.log(`%c 功能变更: ${featuresChanged}, Tab路由变更: ${(routeChanged && routeInfeatures)}, 消息变更: ${messageChanged}, app启动结束: ${hasLaunched}`, 'background: #fafafa; color: #EE3D80')
    return (featuresChanged || (routeChanged && routeInfeatures) || messageChanged) && hasLaunched
  }

  render() {
    let { features, message = [] } = this.props.homeData, 
    curFeature = this
      .props
      .navigation
      .state.routes[
        this
        .props
        .navigation
        .state
        .index
      ].routeName
    curFeature = curFeature.toUpperCase()
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        width,
        height: 54,
        backgroundColor: '#fafafa',
      }}>
      {(features? Object.entries(features) : []).map(item => {
        let feature = item[0]
        let featureName = item[1]
        let has_new = message.some(
          msg => msg.feature === feature.toLowerCase() && msg.has_new
        )
        return (
          <TouchableOpacity
            key={feature}
            style={{ 
              height: 54,
              flex: 1,
            }}
            onPress={this.onPressTab.bind(this, feature)}
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
                color: curFeature === feature ? '#EE3D80' : '#333'
              }}
            >{featureName}</Text>
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
          <TYicon name='ellipsis' size={16} color={curFeature === 'MORE' ? '#EE3D80' : '#333'}></TYicon>
        </TouchableOpacity>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  const { homeData } = state
  return { homeData }
}

export default connect(mapStateToProps, null)(TabBar)
