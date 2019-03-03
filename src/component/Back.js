import React from 'react'
import TYicon from 'app/component/TYicon'
import { View, TouchableOpacity, Text } from 'react-native'
import globalStyles from 'app/component/globalStyles';

const Back = (props) => {
  const { 
    routeName, 
    name, 
    rightButton, 
    centerCom, 
    navigation,
    onLayoutRightBtn,
  } = props
  return (
    <View style={{ 
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomColor: '#eaeaea',
      borderBottomWidth: 1,
      borderStyle: 'solid',
      backgroundColor: '#f5f6f7',
      justifyContent: 'space-between',
    }}>
      <TouchableOpacity
        onPress={navigation ? (routeName 
          ? () => navigation.navigate(routeName) 
          : () => navigation.goBack()) : () => props.goBack()}
        style={{
          //width: 100,
          padding: 10,
          flexDirection: 'row',
          flexWrap: 'wrap'
        }}
      >
        <TYicon name='fanhui' size={16} color='#333333'></TYicon>
        <Text style={{ paddingLeft: 5, fontSize: 16, color: '#333333' }}>
          {name ? name : '返回'}
        </Text>
      </TouchableOpacity>
      {
        centerCom || null
      }
      {
        rightButton
          ? <TouchableOpacity
              onLayout={
                e => onLayoutRightBtn && onLayoutRightBtn(
                  'button',
                  e.nativeEvent.target
                )
              }
              activeOpacity={rightButton.btnDis ? 1 : 0.6}
              style={[
                globalStyles.button, 
                rightButton.btnDis ? globalStyles.buttonDis : null, 
                rightButton.noBorder ? {
                  borderColor: '', 
                  borderWidth: 0, 
                  borderRadius: 0,
                  backgroundColor: 'transparent',
                } : null, {
                  marginVertical: 5,
                  marginHorizontal: 10,
                }
              ]}
              onPress={!rightButton.btnDis ? (rightButton.routeName 
                ? () => navigation.navigate(rightButton.routeName)
                : (rightButton.onPress ? rightButton.onPress : null )) : null}
            >
              {
                rightButton.icon
                  ? <TYicon 
                      onLayout={
                        e => onLayoutRightBtn && onLayoutRightBtn(
                          'icon', 
                          e.nativeEvent.target
                        )
                      }
                      name={rightButton.icon}
                      size={24} 
                      color={rightButton.btnDis ? '#adadad' : '#333333'}
                    >
                    </TYicon> 
                  : null
              }
              {
                rightButton.name 
                  ? <Text 
                      onLayout={
                        e => onLayoutRightBtn && onLayoutRightBtn(
                          'text', e.nativeEvent.target
                        )
                      }
                      style={[
                        globalStyles.buttonText,
                        rightButton.btnDis 
                          ? globalStyles.buttonDisText 
                          : null
                      ]}
                    >
                      {rightButton.name}
                    </Text>
                  : null
              }
            </TouchableOpacity>
          : null
      }
    </View>
  )
}

export default Back
