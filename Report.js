import React, { Component } from 'react'
import { KeyboardAvoidingView, View, TouchableOpacity, TextInput, Text } from 'react-native'
import globalStyles from './globalStyles'

export default class Report extends Component {

  constructor(props) {
    super(props)
    this.state = {
      text: ''
    }
  }
  
  render() {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior='height'
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => this.props.modal.close()}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
        >
          <View style={{
            width: 250,
            backgroundColor: 'white',
            borderRadius: 3,
            padding: 10
          }}>
            <TextInput
              autoFocus={true}
              style={{
                borderColor: '#cccccc', 
                borderWidth: 1,
                paddingTop: 3,
                paddingHorizontal: 7,
                paddingBottom: 4,
                borderRadius: 3,
                marginTop: 10,
                minHeight: 50
              }}
              placeholder='请填写你举报的理由'
              placeholderTextColor="#cccccc"
              autoCapitalize="none"
              multiline={true}
              onChangeText={(text) => this.setState({text})}
              value={this.state.text}
            />
            <View style={{
              flexDirection: 'row'
            }}>
              <TouchableOpacity
                style={[globalStyles.button, {
                  flex: 1,
                  marginTop: 10
                }]}
                onPress={() => this.props.modal.close()}
              >
                <Text style={globalStyles.buttonText}>提交</Text>
              </TouchableOpacity>
              <View style={{ width: 10 }} />
              <TouchableOpacity
                style={[globalStyles.button, {
                  flex: 1,
                  marginTop: 10
                }]}
                onPress={() => {
                  this.props.modal.close()
                }}>
                <Text style={globalStyles.buttonText}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    )
  }

}
