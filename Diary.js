import React from 'react'
import { View, TouchableOpacity, Text, TextInput, KeyboardAvoidingView } from 'react-native'
import TYicon from './TYicon'
import { post } from './request'
import { toast } from './Toast'

export default class DiaryEditor extends React.Component {

  constructor(props) {
    super(props)
    this.state = { 
      content: ''
    }
  }

  componentDidMount() {
    /* this.subs = [
      // this.props.navigation.addListener('willFocus', () => console.log('will focus')),
      // this.props.navigation.addListener('willBlur', () => console.log('will blur')),
      this.props.navigation.addListener('didFocus', () => {
        this._input.focus()
      }),
      this.props.navigation.addListener('didBlur', () => {
        this._input.blur()
      }),
    ] */
  }

  componentWillUnmount() {
    this.subs.forEach((sub) => {
      sub.remove();
    })
  }

  async postDiary() {
    const { content } = this.state

    if (!content.trim()) {
      toast('您没有输入内容。');
    }

    let res = await post('diary', {
      content
    })
    if (res.success) {
      const info = '已记录。'
      this.setState({
        content: ''
      })
      toast(info)
    } else {
      const { info } = res
      toast(info)
    }
  }

  render() {
    return (
      <KeyboardAvoidingView
        keyboardVerticalOffset={62}
        style={{
          flex: 1,
          paddingTop: 3,
          paddingHorizontal: 7
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
            textAlignVertical: 'top'
          }}
          placeholder="记录点滴心语..."
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
          }}>仅自己可见</Text>
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
          onPress={this.postDiary.bind(this)}
        >
          <Text style={{
            alignItems: 'center', 
            color: '#666666', 
            textAlign: 'center'
          }}>记录</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate('DiaryList')}
          style={{
            position: 'absolute',
            width: 48,
            height: 48,
            backgroundColor: 'red',
            bottom: 20,
            right: 20,
            borderRadius: 24,
            elevation:4,
            shadowOffset: { width: 5, height: 5 },
            shadowColor: "grey",
            shadowOpacity: 0.5,
            shadowRadius: 10,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/*<Text
            style={{
            color: '#ffffff',
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: 48,
          }}>省</Text>*/}
          <TYicon name='beizhuyitianxie' size={32} color='white'></TYicon>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    )
  }
}
