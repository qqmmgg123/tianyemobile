import React from 'react'
import {
  View,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  Text
} from 'react-native'
import { post } from './request'
import TYicon from './TYicon'

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
    return (
      <KeyboardAvoidingView
        keyboardVerticalOffset={20}
        style={{
          flex: 1,
          paddingTop: 3,
          paddingHorizontal: 7,
          paddingBottom: 100,
        }}
        behavior='position'
      >
        <TextInput
          onChangeText={(content) => this.setState({content})}
          autoFocus={true}
          value={this.state.content}
          ref={ref => {
            this._input = ref
          }}
          style={{
            flex: 1,
            paddingTop: 3,
            paddingHorizontal: 7,
            paddingBottom: 4,
            marginTop: 10,
            minHeight: 250
          }}
          placeholder={this.props.placeholder}
          placeholderTextColor="#999999"
          autoCapitalize="none"
          multiline={true}
        />
        <View
          style={{
            borderRadius: 3,
            backgroundColor: '#f2f2f2',
            borderColor: '#e6e6e6',
            borderStyle: 'solid',
            borderWidth: 1,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 10
          }}
        >
          <Text style={{
            color: '#adadad',
            fontSize: 12,
            marginRight: 10
          }}>仅知己可见</Text>
          <TYicon name='suoding' size={16} color='#b8b8b8'></TYicon>
        </View>
        <TouchableOpacity
          style={{
            borderColor: '#dddddd', 
            borderWidth: 1, 
            borderRadius: 3,
            justifyContent: 'center',
            height: 36,
            paddingVertical: 10,
            marginTop: 10
          }}
          onPress={() => this.postHelp()}
        >
          <Text style={{
            alignItems: 'center', 
            color: '#666666', 
            textAlign: 'center'
          }}>诉出</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    )
  }
}


