import React from 'react'
import {
  View,
  KeyboardAvoidingView,
  TextInput,
  Text,
  findNodeHandle
} from 'react-native'
import { post } from './request'
import TYicon from './TYicon'
import globalStyles from './globalStyles'

export default class HelpEditor extends React.Component {

  constructor(props) {
    super(props)
    this.state = { 
      content: '',
    }
  }

  async postHelp() {
    const { content } = this.state

    let res = await post('trouble', {
      content
    })
    if (res.success) {
      this.props.listRefresh()
    }
  }

  render() {
    let { onInputChange } = this.props
    return (
        <KeyboardAvoidingView
          keyboardVerticalOffset={20}
          style={{ flex: 1 }}
          behavior='padding'
        >
          <View
            style={{flex: 1}}
            onStartShouldSetResponderCapture={(e) => {
              let target = e.nativeEvent.target
              if (target !== findNodeHandle(this._input)
                && (target !== findNodeHandle(this._button))
                && (target !== findNodeHandle(this._buttonText))) {
                  this._input && this._input.blur();
              }
            }}
          >
            <TextInput
              onChangeText={(content) => {
                this.setState({content}, () => {
                  onInputChange(!this.state.content.trim())
                })
              }}
              autoFocus={true}
              value={this.state.content}
              ref={ref => {
                this._input = ref
              }}
              style={{
                flex: 1,
                color: '#333',
                padding: 10,
                marginTop: 10,
                fontSize: 16,
                textAlignVertical: 'top'
              }}
              placeholder={this.props.placeholder}
              placeholderTextColor="#999999"
              autoCapitalize="none"
              multiline={true}
            />
            <View style={globalStyles.splitLine}></View>
            <View
              style={{
                paddingVertical: 10,
                height: 42,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{
                color: '#adadad',
                fontSize: 12,
                marginRight: 10
              }}>知己可见</Text>
              <TYicon name='suoding' size={16} color='#b8b8b8'></TYicon>
            </View>
            <View style={globalStyles.splitLine}></View>
          </View>
        </KeyboardAvoidingView>
    )
  }
}


