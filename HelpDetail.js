import React, { Component } from 'react'
import { ScrollView, findNodeHandle, KeyboardAvoidingView, View, FlatList, TextInput, Text, TouchableOpacity, TouchableWithoutFeedback, RefreshControl, Animated } from 'react-native'
import { get, post, getUserInfo } from './request'
import Back from './component/Back'
import globalStyles from './globalStyles'

let noDataTips = '当前没有内容'

const ANIMATION_DURATION = 250

class ReplyItem extends React.Component {

  constructor(props) {
    super(props)
    this._animated = new Animated.Value(1)
  }

  async removeReply(id) {
    const res = await del(`trouble/${id}`)
    if (res.success) {
      this.onRemove()
    }
  }

  onRemove = () => {
    const { onRemove } = this.props
    if (onRemove) {
      Animated.timing(this._animated, {
        toValue: 0,
        duration: ANIMATION_DURATION,
      }).start(() => onRemove())
    }
  }

  render() {
    const rowStyles = [
      { opacity: this._animated }
    ]
    const { 
      _id, 
      creator_id, 
      content = '',
      remark = [], 
      rremark = [],
      username = '', 
      ref_id, 
      ref_title = '', 
      ref_summary = '', 
      reply_type, 
      receivername = ''
    } = this.props
    const replyName = (remark && remark[0] || username || '')
    return (
      <Animated.View style={rowStyles}>
        <TouchableOpacity
          key={_id}
          style={{
            padding: 10
          }}
          onLongPress={() => this.removeReply()}
          onPress={() => this.props.onReply({ 
            replyType: 'reply', 
            replyId: _id,
            parentId: _id,
            receiverId: creator_id,
            receiverName: replyName
          })}
        >
          <Text style={{
            fontSize: 14,
            lineHeight: 24,
            color: '#333'
          }}>
            {replyName + (reply_type === 'reply' ? '@' + (rremark && rremark[0] || receivername) : '') + '：' + (content || '')}
          </Text>
          {ref_id && ref_id[0] ? (
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('ClassicDetail', {
                itemId: ref_id
              })}
              style={{
                borderLeftColor: '#ccc',
                borderLeftWidth: 3,
                backgroundColor: '#eaeaea',
                padding: 10,
                marginTop: 10
              }}
            >
              <Text style={{
                color: '#666',
                fontSize: 14
              }}>{ref_title || ''}</Text>
              <Text style={{
                color: '#999',
                marginTop: 5,
                fontSize: 12
              }}>{ref_summary || ''}</Text>
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      </Animated.View>
    )
  }
}

class DetailView extends Component {
  render() {
    let { help } = this.props
    return (
      <View style={{
        flex: 1
      }}>
        <View style={{
          flex: 1,
          marginTop: 20,
          paddingHorizontal: 10,
          paddingBottom: 20
        }}>
          <Text
            style={{
              fontSize: 16,
              lineHeight: 28,
              color: '#333333',
            }}
          >{help && help.content || ''}</Text>
        </View>
        <View style={{
          marginTop: 5,
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}>
          <TouchableOpacity
            style={{
              padding: 10
            }}
            onPress={() => {
              console.log('来了......')
              this.props.onReply({ 
                replyType: 'help', 
                replyId: help._id,
                parentId: help._id,
                receiverId: help.creator_id 
              })}
            }
          >
            <Text style={{ 
              fontSize: 14,
              color: '#666',
            }}>回复</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              padding: 10
            }}
            onPress={() => this.removeHelp(_id)}
          >
            <Text style={{ 
            fontSize: 14,
            color: '#666'
            }}>已排解</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

export default class HelpDetail extends Component {

  constructor(props) {
    super(props)
    this.state = {
      help: null,
      noDataTips,
      refreshing: false,
      reply: '',
      replyVisible: false,
    }
  }

  async replyConfirm() {
    this._replyInput && this._replyInput.blur()
    const data = Object.assign(this.state.replyData, { content: this.state.reply })
    const { content, replyId, replyType, parentId, receiverId } = data
    let res = await post(`${replyType}/${replyId}/reply`, { 
      content,
      parent_id: parentId,
      parent_type: 'help',
      receiver_id: receiverId
    })
    if (res) {
      const { success } = res
      let { help } = this.state
      if (help && success) {
        let user = getUserInfo()
        let { reply } = res
        reply.username = user.username
        if (replyType === 'reply') {
          let replyTo = help.replies.find(item => item._id === replyId)
          reply.receivername = replyTo.remark[0] || replyTo.username[0] || ''
        }
        help.replies = help.replies || []
        help.replies.unshift(reply)
        this.setState({
          help
        })
      }
    }
  }

  onReply(data) {
    this.setState({
      replyVisible: true,
      reply: '',
      replyData: data
    })
  }

  inputBlur() {
    if (this.state.replyVisible) {
      this.setState({ replyVisible: false })
    }
  }

  refresh = () => {
    this.loadData()
  }

  async loadData() {
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

  componentWillMount() {
    this.loadData()
  }

  componentDidUpdate(props, state) {
    let { replyVisible } = state
    if (this.state.replyVisible && replyVisible !== this.state.replyVisible) {
      this._replyInput.focus()
    }
  }

  render() {
    let { help } = this.state
    const { receiverName = '' } = this.state.replyData || {}
    if (help) {
      let { replies } = help
      return (
        <View 
          style={{ flex: 1 }}
          onStartShouldSetResponderCapture={(e) => {
            console.log('进来了...')
            let target = e.nativeEvent.target
            console.log(target)
            if (target !== findNodeHandle(this._replyInput)
              && (target !== findNodeHandle(this._replyButton))
              && (target !== findNodeHandle(this._replyButtonText))) {
                this._replyInput && this._replyInput.blur();
                console.log('blur......')
            }
          }}
        >
          <Back navigation={this.props.navigation} />
          {replies && replies.length ? <FlatList
              style={{
                paddingHorizontal: 15,
                paddingBottom: 15
              }}
              data={replies}
              ListHeaderComponent={<DetailView help={help} onReply={(data) => this.onReply(data)} />}
              renderItem={({item, index}) => <ReplyItem 
                navigation={this.props.navigation}
                onReply={this.onReply.bind(this)} 
                {...item} 
                onRemove={() => {
                  replies.splice(index, 1)
                  this.setState({
                    replies
                  })
                }} 
              />}
              ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
              keyExtractor={(item) => (item._id)}
            /> : (<View>
              <Text style={{
                color: '#333333',
                textAlign: 'center',
                paddingTop: 20
              }}>
                {this.state.noDataTips}
              </Text>
            </View>)}
            {this.state.replyVisible ? (<KeyboardAvoidingView
              keyboardVerticalOffset={20}
              contentContainerStyle={{
                flexDirection: 'row',
                padding: 10,
                backgroundColor: 'white',
                alignItems: 'center'
              }}
              style={{
                position: 'absolute', 
                left: 0, 
                right: 0, 
                bottom: 0
              }} 
              behavior="position"
            >
              <TextInput
                ref={ref => this._replyInput = ref}
                style={{
                  flex: 1,
                  borderColor: '#cccccc', 
                  borderWidth: 1,
                  height: 36,
                  paddingTop: 3,
                  paddingHorizontal: 7,
                  paddingBottom: 4,
                  borderRadius: 3,
                  backgroundColor: 'white',
                  marginRight: 8
                }}
                placeholder={receiverName ? "回复" + receiverName : "回复..."}
                placeholderTextColor="#cccccc"
                allowFontScaling={false}
                autoCapitalize="none"
                underlineColorAndroid='transparent'
                onChangeText={text => this.setState({ reply: text })}
                onBlur={() => this.inputBlur()}
              />
              {this.state.reply.trim() ? (<TouchableOpacity 
                ref={ref => this._replyButton = ref}
                style={globalStyles.button}
                onPress={this.replyConfirm.bind(this)}
              >
                <Text 
                  ref={ref => this._replyButtonText = ref}
                  style={globalStyles.buttonText}>送出</Text>
              </TouchableOpacity>) : null}
            </KeyboardAvoidingView>) : null}
          </View>
        )
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Back navigation={this.props.navigation} />
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this.refresh}
              />
            }
          >
            <Text style={globalStyles.noDataText}>您查看的内容已被删除。</Text>
          </ScrollView>
        </View>
      )
    }
  }
}
