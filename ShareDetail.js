import React, { Component } from 'react'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { get } from './request'
import Back from './component/Back'

export default class ShareDetail extends Component {

  constructor(props) {
    super(props)
    this.state = {
      share: null
    }
  }

  async componentWillMount() {
    const shareId = this.props.navigation.getParam('itemId')
    let data = await get(`share/${shareId}`)
    console.log(data)
    let { success, share } = data
    if (success) {
      this.setState({
        share
      })
    }
  }

  render() {
    let { share } = this.state

    return (
      <View style={{ flex: 1 }}>
        <Back navigation={this.props.navigation} />
        <ScrollView style={{
          marginTop: 20,
          height: 200
        }}>
          <View style={{
            flex: 1,
            marginTop: 20,
            paddingHorizontal: 10,
          }}>
            <Text
              style={{
                fontSize: 20,
                lineHeight: 32,
                textAlign: 'center'
              }}
            >{share && share.title || ''}</Text>
          </View>
          <View style={{
            flex: 1,
            marginTop: 20,
            paddingHorizontal: 10,
            paddingBottom: 20
          }}>
            <Text style={{
              flex: 1,
              color: '#333333',
              fontSize: 16,
              lineHeight: 28
            }}>
            {share && share.content || ''}
            </Text>
          </View>
        </ScrollView>
      </View>
    )
  }
}
