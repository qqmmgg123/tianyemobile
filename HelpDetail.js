import React, { Component } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { get } from './request'

export default class HelpDetail extends Component {

  constructor(props) {
    super(props)
    this.state = {
      help: null
    }
  }

  async componentWillMount() {
    const troubleId = this.props.navigation.getParam('itemId')
    let data = await get(`help/${troubleId}`)
    console.log(data)
    let { success, help } = data
    if (success) {
      this.setState({
        help
      })
    }
  }

  render() {
    let { help } = this.state

    return (
      <ScrollView>
        <View>
          <TouchableOpacity
            onPress={() => this.props.navigation.goBack()}
            style={{
              padding: 10
            }}
          >
            <Text>返回</Text>
          </TouchableOpacity>
        </View>
        <View>
          <Text
            style={{
              fontSize: 20
            }}
          >{help && help.content || ''}</Text>
        </View>
      </ScrollView>
    )
  }
}
