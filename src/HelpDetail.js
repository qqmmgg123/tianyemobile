import React, { Component } from 'react'
import { 
  ScrollView, 
  KeyboardAvoidingView, 
  View, 
  FlatList, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  RefreshControl, 
  Animated,
  Platform,
} from 'react-native'
import { connect } from 'react-redux'
import { get, post, del, getUserInfo } from 'app/component/request'
import Back from 'app/component/Back'
import globalStyles from 'app/component/globalStyles'
import { STATUS_BAR_HEIGHT } from 'app/component/Const'
import ActionModal from 'app/Karma/ActionModal'

let noDataTips = '当前没有内容'
const ANIMATION_DURATION = 250

class ReplyItem extends React.Component {

  constructor(props) {
    super(props)
    this._animated = new Animated.Value(1)
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
      receivername = '',
      curUserId,
      onShowAction
    } = this.props
    const replyName = (remark && remark[0] || username || '')
    return (
      <Animated.View style={rowStyles}>
        <TouchableOpacity
          key={_id}
          style={{
            padding: 10
          }}
          onPress={creator_id !== curUserId ? () => onReply({ 
            replyType: 'reply', 
            replyId: _id,
            parentId: _id,
            receiverId: creator_id,
            receiverName: replyName
          }) : () => onShowAction()}
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

  async removeMind(id) {
    const res = await del(`mind/${id}`)
    if (res.success) {
      this.onRemove()
    }
  }

  render() {
    let { help, curUserId } = this.props
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
          {
            help.creator_id === curUserId
              ? <TouchableOpacity
                  style={{
                    padding: 10
                  }}
                  onPress={() => this.removeHelp(_id)}
                >
                  <Text style={{ 
                  fontSize: 14,
                  color: '#666'
                  }}>{help.type_id === 'help' ? '已解' : '删除'}</Text>
                </TouchableOpacity>
              : null
          }
        </View>
      </View>
    )
  }
}

class HelpDetail extends Component {

  constructor(props) {
    super(props)
    this.state = {
      help: null,
      noDataTips,
      refreshing: false,
      reply: ''
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
      reply: '',
      replyData: data
    }, () => {
      this._replyInput.focus()
    })
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

  async removeReply(id, index) {
    console.log(id, index)
    const res = await del(`reply/${id}`)
    if (res.success) {
      let { help } = this.state
      let { replies } = help
      replies.splice(index, 1)
      this.setState({
        replies
      })
    }
  }

  showActionModal(id, index) {
    this._modal.open('ActionSelect', {
      onRemoveReply: () => this.removeReply(id, index)
    })
  }

  render() {
    let { noDataTips, help, reply } = this.state
    const { receiverName = '' } = this.state.replyData || {}
    const { userId = '' } = this.props.loginData
    const { navigation } = this.props
    if (help) {
      let { replies } = help
      return (
        <View 
          style={{ flex: 1 }}
        >
          <Back navigation={navigation} />
          {replies && replies.length ? <FlatList
              contentContainerStyle={{
                paddingHorizontal: 15,
                paddingBottom: 15
              }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              data={replies}
              ListHeaderComponent={
                <DetailView 
                  curUserId={userId} 
                  help={help} 
                  onReply={(data) => this.onReply(data)} 
                />
              }
              renderItem={({item, index}) => <ReplyItem 
                navigation={navigation}
                onReply={this.onReply.bind(this)} 
                curUserId={userId}
                onShowAction={() => this.showActionModal(item._id, index)}
                {...item}
              />}
              ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
              keyExtractor={(item) => (item._id)}
            /> : (<View>
              <Text style={{
                color: '#333333',
                textAlign: 'center',
                paddingTop: 20
              }}>
                {noDataTips}
              </Text>∂
            </View>)}
            <KeyboardAvoidingView
              keyboardVerticalOffset={Platform.select({ios: STATUS_BAR_HEIGHT, android: null})}
              behavior={Platform.select({ios: 'padding', android: null})}
              style={{
                left: 0, 
                right: 0, 
                padding: 10,
                alignItems: 'center',
                backgroundColor: 'white',
                flexDirection: 'row',
              }}
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
              />
              {
                reply.trim() 
                  ? <TouchableOpacity 
                    style={globalStyles.button}
                    onPress={this.replyConfirm.bind(this)}
                  >
                    <Text 
                      style={globalStyles.buttonText}
                    >
                      送出
                    </Text>
                    </TouchableOpacity> 
                  : null
              }
            </KeyboardAvoidingView> 
              <ActionModal 
                navigation={this.props.navigation}
                ref={ ref => this._modal = ref }
              />
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
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <Text style={globalStyles.noDataText}>您查看的内容已被删除。</Text>
          </ScrollView>
        </View>
      )
    }
  }
}

const mapStateToProps = (state) => {
  const { loginData } = state
  return { loginData }
}

export default connect(mapStateToProps)(HelpDetail)
