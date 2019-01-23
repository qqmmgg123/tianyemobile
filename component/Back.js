import React from 'react'
import TYicon from '../TYicon'
import { View, TouchableOpacity, Text } from 'react-native'
import globalStyles from '../globalStyles';

const Back = (props) => {
  const { routeName, name, rightButton, navigation } = props
  return (
    <View style={{ 
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomColor: '#eaeaea',
      borderBottomWidth: 1,
      borderStyle: 'solid',
    }}>
      <TouchableOpacity
        onPress={navigation ? (routeName 
          ? () => navigation.navigate(routeName) 
          : () => navigation.goBack()) : () => props.goBack()}
        style={{
          flex: 1,
          padding: 10,
          flexDirection: 'row'
        }}
      >
        <TYicon name='fanhui' size={16} color='#333333'></TYicon>
        <Text style={{ paddingLeft: 5, fontSize: 16, color: '#333333' }}>
          {name ? name : '返回'}
        </Text>
      </TouchableOpacity>
      {
        rightButton
          ? (<TouchableOpacity
              activeOpacity={rightButton.btnDis ? 1 : 0.6}
              style={[
                globalStyles.button, 
                rightButton.btnDis ? globalStyles.buttonDis : null, 
                rightButton.noBorder ? {
                  borderColor: '', 
                  borderWidth: 0, 
                  borderRadius: 0,
                } : null, {
                  marginVertical: 5,
                  marginHorizontal: 10
                }
              ]}
              onPress={!rightButton.btnDis ? (rightButton.routeName 
                ? () => navigation.navigate(rightButton.routeName)
                : (rightButton.onPress ? rightButton.onPress : null )) : null}
            >
              {rightButton.icon ? (<TYicon 
                name={rightButton.icon}
                size={24} 
                color={rightButton.btnDis ? '#adadad' : '#333333'}></TYicon>) : null}
              {rightButton.name ? (<Text style={[
                globalStyles.buttonText,
                rightButton.btnDis 
                  ? globalStyles.buttonDisText 
                  : null]}>{rightButton.name}</Text>) : null}
            </TouchableOpacity>)
          : null
      }
    </View>
  )
}

export default Back
