import React from 'react'
import { 
  KeyboardAvoidingView,
  View, 
  TouchableOpacity, 
  TextInput, 
  Text,
  Platform,
  ScrollView,
} from 'react-native'
import { toast } from 'app/Toast'
import { put, post, del } from 'app/component/request'
import globalStyles from 'app/component/globalStyles'
import Back from 'app/component/Back'
import { Switch } from 'react-native-gesture-handler'
import { STATUS_BAR_HEIGHT } from 'app/component/Const'

export default class AcceptPrompt extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      recipient_id: '',
      remark: '',
      shareHelp: true,
      shareShare: true,
    }
  }

  async requestConfirm() {
    const id = this.props.navigation.getParam('friendId')
    const { content, remark, shareHelp, shareShare } = this.state
    let res = await post(`friend/${id}/send`, {
      content,
      remark,
      shareHelp,
      shareShare,
    })
    if (res) {
      const { success } = res
      if (success) {
        this.props.navigation.state.params.onAdd();
      }
    }
  }

  async acceptConfirm() {
    const id = this.props.navigation.getParam('friendId')
    const { remark, shareHelp, shareShare } = this.state
    const res = await put(`friend/${id}/accept`, {
      remark,
      shareHelp,
      shareShare,
    })
    if (res) {
      const { success } = res
      if (success) {
        this.props.navigation.state.params.onListRefresh()
      }
    }
  }

  async denyConfirm() {
    const id = this.props.navigation.getParam('friendId')
    const res = await del(`friend/${id}/remove`, {
      content: this.state.content
    })
    if (res) {
      const { success } = res
      if (success) {
        this.props.navigation.state.params.onDenyConfirm()
      }
    }
  }

  async remarkConfirm() {
    const { 
      recipient_id, 
      remark, 
      shareHelp, 
      shareShare 
    } = this.state
    const res = await put(`friend/${recipient_id}/remark`, {
      remark,
      shareHelp,
      shareShare,
    })
    if (res) {
      const { success } = res
      if (success) {
        this.props.navigation.state.params.onListRefresh()
      }
    }
  }

  resetState() {
    this.setState({
      remark: '',
      content: ''
    })
  }

  componentDidMount() {
    const friendship = this.props.navigation.getParam('friendship')
    if (friendship) {
      const { 
        recipient_id = '', 
        remark = '', 
        shareHelp = true, 
        shareShare = true 
      } = friendship
      this.setState({
        recipient_id,
        remark,
        shareHelp,
        shareShare,
      })
    }
  }

  render() {
    const status = this.props.navigation.getParam('status')
    const { remark, shareHelp, shareShare } = this.state

    return (
      <View
        style={globalStyles.container} 
      >
        <Back 
          mode="close"
          navigation={this.props.navigation} 
        />
        <KeyboardAvoidingView
          keyboardVerticalOffset={Platform.select({ios: STATUS_BAR_HEIGHT, android: null})}
          behavior={Platform.select({ios: 'padding', android: null})}
          style={{ flex: 1 }}
        >
          <ScrollView 
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{
              backgroundColor: '#fff',
              padding: 20,
            }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <View style={{
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
                placeholder='向对方说点什么...'
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
              <View>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 10,
                }}>
                  <Text style={{
                    flex: 1
                  }}>与他（她）共享烦恼</Text>
                  <Switch 
                    style={{
                      marginLeft: 10
                    }}
                    value={shareHelp}
                    onValueChange={shareHelp => this.setState({
                      shareHelp
                    })}
                  ></Switch>
                </View>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 10,
                }}>
                  <Text style={{
                    flex: 1
                  }}>与他（她）共享感悟</Text>
                  <Switch 
                    style={{
                      marginLeft: 10
                    }}
                    value={shareShare}
                    onValueChange={shareShare => this.setState({
                      shareShare
                    })}
                  ></Switch>
                </View>
              </View>
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
                        toast('有缘人申请已发送，等到对方验证')
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
                    this.props.navigation.goBack()
                  }}>
                  <Text style={globalStyles.buttonText}>{status === 'add'? '送出' : '确定'}</Text>
                </TouchableOpacity>
                <View style={{ width: 10 }} />
                <TouchableOpacity
                  style={[globalStyles.button, { flex: 1 }]}
                  onPress={() => {
                    this.props.navigation.goBack()
                  }}>
                  <Text 
                    style={globalStyles.buttonText}
                  >
                    取消
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    )
  }
}
