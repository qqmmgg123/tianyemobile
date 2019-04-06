import React from 'react'
import TYicon from 'app/component/TYicon'
import { View, TouchableOpacity, Text } from 'react-native'
import globalStyles from 'app/component/globalStyles';

const Back = (props) => {
  let { 
    routeName, 
    name, 
    rightButton, 
    centerCom, 
    navigation,
    onLayoutRightBtn,
    mode = 'back'
  } = props
  rightButton = rightButton ? (rightButton.length ? rightButton : [ rightButton ]) : null
  let isCloseMode = mode === 'close'
  return (
    <View style={{ 
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomColor: '#eaeaea',
      borderBottomWidth: 1,
      borderStyle: 'solid',
      backgroundColor: '#fafafa',
      justifyContent: 'space-between',
    }}>
      <TouchableOpacity
        onPress={navigation ? (routeName 
          ? () => navigation.navigate(routeName) 
          : () => navigation.goBack()) : () => props.goBack()}
        style={{
          //width: 100,
          alignItems: 'center',
          padding: 10,
          flexDirection: 'row',
          flexWrap: 'wrap'
        }}
      >
        <TYicon 
          name={!isCloseMode ? 'fanhui' : 'guanbi'} 
          size={16} 
          color='#333333'
        ></TYicon>
        <Text style={{ paddingLeft: 5, fontSize: 16, color: '#333333' }}>
          {name ? name : (!isCloseMode ? '返回' : '取消')}
        </Text>
      </TouchableOpacity>
      {
        centerCom || null
      }
      <View
        style={{
          flexDirection: 'row'
        }}
      >
        {
          rightButton
            ? rightButton.map(
                (btn, index) => 
                  <TouchableOpacity
                    key={index}
                    style={[
                      globalStyles.button, 
                      btn.btnDis ? globalStyles.buttonDis : null, 
                      btn.noBorder ? {
                        borderColor: '', 
                        borderWidth: 0, 
                        borderRadius: 0,
                        backgroundColor: 'transparent',
                      } : null, {
                        marginVertical: 5,
                        marginRight: 10,
                      }
                    ]}
                    activeOpacity={btn.btnDis ? 1 : 0.6}
                    onLayout={
                      e => onLayoutRightBtn && onLayoutRightBtn(
                        'button',
                        e.nativeEvent.target
                      )
                    }
                    onPress={!btn.btnDis ? (btn.routeName 
                      ? () => navigation.navigate(btn.routeName)
                      : (btn.onPress ? btn.onPress : null )) : null}
                  >
                    {
                      btn.icon
                        ? <TYicon 
                            onLayout={
                              e => onLayoutRightBtn && onLayoutRightBtn(
                                'icon', 
                                e.nativeEvent.target
                              )
                            }
                            name={btn.icon}
                            size={24} 
                            color={btn.btnDis ? '#adadad' : '#333333'}
                          >
                          </TYicon> 
                        : null
                    }
                    {
                      btn.name 
                        ? <Text 
                            onLayout={
                              e => onLayoutRightBtn && onLayoutRightBtn(
                                'text', e.nativeEvent.target
                              )
                            }
                            style={[
                              globalStyles.buttonText,
                              btn.btnDis 
                                ? globalStyles.buttonDisText 
                                : null
                            ]}
                          >
                            {btn.name}
                          </Text>
                        : null
                    }
                  </TouchableOpacity>
                )
            : null
        }
      </View>
    </View>
  )
}

export default Back
