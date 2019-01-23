import React from 'react'
import { 
  KeyboardAvoidingView,
  View, 
  TouchableOpacity, 
  TextInput, 
  Text,
} from 'react-native'
import { put, post } from '../request'

export default class AcceptPrompt extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      remark: ''
    }
  }

  async requestConfirm() {
    const id = this.props.modal.getParam('friendId')
    let res = await post(`friend/${id}/send`, {
      content: this.state.content,
      remark: this.state.remark,
    })
    if (res) {
      const { success } = res
      if (success) {
        this.props.onAdd()
      }
    }
  }

  async acceptConfirm() {
    const id = this.props.modal.getParam('friendId')
    const res = await put(`friend/${id}/accept`, {
      content: this.state.content
    })
    if (res) {
      const { success } = res
      if (success) {
        this.props.listRefresh()
      }
    }
  }

  async denyConfirm() {
    const id = this.props.modal.getParam('friendId')
    const onDenyConfirm = this.props.modal.getParam('onDenyConfirm')
    const res = await del(`/friend/${id}/remove`, {
      remark: this.state.remark
    })
    if (res) {
      const { success } = res
      if (success) {
        onDenyConfirm()
      }
    }
  }

  async remarkConfirm() {
    const id = this.props.modal.getParam('friendId')
    const res = await put(`/friend/${id}/remark`, {
      remark: this.state.remark
    })
    if (res) {
      const { success } = res
      if (success) {
        this.props.listRefresh()
      }
    }
  }

  resetState() {
    this.setState({
      remark: '',
      content: ''
    })
  }

  render() {
    const status = this.props.modal.getParam('status')

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
            {status === 'add' || status === 'deny' ? (<TextInput
              autoFocus={true}
              style={{
                borderColor: '#cccccc', 
                borderWidth: 1,
                paddingTop: 3,
                paddingHorizontal: 7,
                paddingBottom: 4,
                borderRadius: 3,
                marginTop: 10,
                minHeight: 36
              }}
              placeholder='说点什么...'
              placeholderTextColor="#cccccc"
              autoCapitalize="none"
              onChangeText={(content) => {
                this.setState({content})
              }}
              value={this.state.content}
            />) : null}
            {status === 'add' || status === 'accept' || status === 'remark' ? (<TextInput
              autoFocus={true}
              style={{
                borderColor: '#cccccc', 
                borderWidth: 1,
                paddingTop: 3,
                paddingHorizontal: 7,
                paddingBottom: 4,
                borderRadius: 3,
                marginTop: 10,
                minHeight: 36
              }}
              placeholder='备注名'
              placeholderTextColor="#cccccc"
              autoCapitalize="none"
              onChangeText={(remark) => {
                this.setState({remark})
              }}
              value={this.state.remark}
            />) : null}
            <View style={{
              marginTop: 10,
              flexDirection: 'row'
            }}>
              <TouchableOpacity
                style={[globalStyles.button, { 
                  flex: 1,
                }]}
                onPress={() => {
                  switch (status) {
                    case 'add':
                      this.requestConfirm()
                      break
                    case 'accept':
                      this.acceptConfirm()
                      break
                    case 'deny':
                      this.denyConfirm()
                      break
                    case 'remark':
                      this.remarkConfirm()
                      break
                  }
                  this.props.modal.close()
                }}>
                <Text style={globalStyles.buttonText}>{status === 'add'? '送出' : '确定'}</Text>
              </TouchableOpacity>
              <View style={{ width: 10 }} />
              <TouchableOpacity
                style={[globalStyles.button, { flex: 1 }]}
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
