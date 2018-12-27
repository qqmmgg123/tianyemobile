import React, { Component } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { get } from './request'

export default class ClassicDetail extends Component {

  constructor(props) {
    super(props)
    this.state = {
      classic: null
    }
  }

  async componentWillMount() {
    const classicId = this.props.navigation.getParam('itemId')
    let data = await get(`classic/${classicId}`)
    console.log(data)
    let { success, classic } = data
    if (success) {
      this.setState({
        classic
      })
    }
  }

  render() {
    let { classic } = this.state

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
              fontSize: 20,
              textAlign: 'center'
            }}
          >{classic && classic.title || ''}</Text>
          <Text>{classic && classic.summary || ''}</Text>
          <View>
            <Text style={{
              color: '#333333',
              fontSize: 16
            }}>{classic && classic.content || ''}</Text>
          </View>
        </View>
      </ScrollView>
    )
  }
}
