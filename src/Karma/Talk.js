import React from 'react'
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  Text, 
  TextInput, 
  KeyboardAvoidingView, 
  Animated, 
  Platform,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from 'app/HomeActions'
import { get, post, del, getUserByMemory } from 'app/component/request'
import globalStyles from 'app/component/globalStyles'
import TYicon from 'app/component/TYicon'
import { Empty, Footer } from 'app/component/ListLoad'
import { STATUS_BAR_HEIGHT } from 'app/component/Const'
import ActionModal from 'app/Karma/ActionModal'
import TalkEmptyGuide from 'app/Friend/TalkEmptyGuide'
import { ANIMATION_DURATION, MIND_TYPES } from 'app/component/Const'
import { getDate } from 'app/utils'

class ReplyItem extends React.Component {

  constructor(props) {
    super(props)
    this._animated = new Animated.Value(1)
  }

  render() {
    const rowStyles = [
      { opacity: this._animated }
    ]
    const { reply, curUserId, navigation, onShowAction, onReply } = this.props
    const replyName = (reply.remark && reply.remark[0] || reply.username || '')

    return (
      <Animated.View 
        key={reply._id} 
        style={rowStyles}
      >
        <TouchableOpacity
          style={{
            padding: 10
          }}
          onPress={reply.creator_id !== curUserId ? () => onReply() : () => onShowAction()}
        >
          <Text style={{
            fontSize: 14,
            lineHeight: 24,
            color: '#333'
          }}>
            {replyName + (reply.reply_type === 'reply' ? '@' + (reply.rremark && reply.rremark[0] || reply.receivername) : '') + '：' + (reply.content || '')}
          </Text>
          {reply.ref_id && reply.ref_id[0] ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('ClassicDetail', {
                itemId: reply.ref_id
              })}
              style={globalStyles.quoteBg}
            >
              <Text style={globalStyles.quoteTitle}>
                {reply.ref_title || ''}
              </Text>
              <Text style={globalStyles.quoteSummary}>
                {reply.ref_summary || ''}
              </Text>
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      </Animated.View>
    )
  }

}

class HelpItem extends React.Component {

  constructor(props) {
    super(props)
    this._readed = 0
    this._animated = new Animated.Value(1)
    const { curReply } = props
    const { summary } = curReply
    this.state = {
      loading: false,
      text: summary,
      curReply,
      content: '',
      summary,
      expand: false
    }
  }

  async loadMind(mindId) {
    let data = await get(`mind/${mindId}`)
    if (data) {
      let { success, mind } = data
      let { content } = mind
      if (success) {
        this.setState({
          content: content,
          text: content,
          expand: true,
          loading: false
        })
      }
    }
  }

  async removeReply(id, helpIndex, index) {
    const res = await del(`reply/${id}`)
    if (res.success) {
      this.onRemove(helpIndex, index)
    }
  }

  onRemove(helpIndex, index) {
    const { onRemove } = this.props
    if (onRemove) {
      Animated.timing(this._animated, {
        toValue: 0,
        duration: ANIMATION_DURATION,
      }).start(() => onRemove(helpIndex, index))
    }
  }

  mindComment = () => {
    const { msgCount, onRemoveMsgTips } = this.props
    const { curReply } = this.state
    const { _id } = curReply
    this.props.navigation.navigate('HelpDetail', {
      itemId: _id,
      action: 'comment',
      onBackRemove: () => this.onRemove()
    })
    this._readed += 1 
    curReply.reply_visit_date = new Date()
    this.setState({
      curReply: curReply
    }, () => {
      if (this._readed >= msgCount) {
        onRemoveMsgTips()
      }
    })
  }

  showActionModal(id, index) {
    this.props.onShowActionModal((helpIndex) => {
      this.removeReply(id, helpIndex, index)
    })
  }

  moreButton(id, reply_count) {
    if (reply_count > 5) {
      return (
        <TouchableOpacity 
          onPress={() => this.props.navigation.navigate('HelpDetail', {
            itemId: id
          })}
          style={{
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text style={{ 
            fontSize: 14,
            color: '#666',
            height: 27,
            lineHeight: 27,
            paddingRight: 14,
          }}>还有 {reply_count - 5} 条回复</Text>
          <TYicon 
            style={{
              transform: [{ rotate: '180deg'}],
              marginBottom: 2
            }}
            name='fanhui' 
            size={16} 
            color='#ccc'
          ></TYicon>
        </TouchableOpacity>
      )
    } else {
      return null
    } 
  }

  render() {
    const { text, content, expand, curReply } = this.state
    const { navigation, onReply } = this.props
    const { 
      replies, 
      _id, 
      type_id,
      column_id,
      curUserId,
      creator_id, 
      reply_count, 
      author, 
      friend,
      is_extract,
      created_date,
      updated_date,
      new_reply_date,
      reply_visit_date,
    } = curReply
    const username = (friend && friend.remark) || (author && (author.panname || author.username)) || ''
    const hasNew = new_reply_date > reply_visit_date
    return (
      <View 
        style={{
          padding: 10,
          backgroundColor: 'white'
        }}
      >
        <View
          style={{
            flexDirection: 'row'
          }}
        >
          {
            hasNew
              ? <View 
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#EE3D80',
                    marginTop: 8,
                    marginRight: 10,
                    alignSelf: 'flex-start'
                  }}
                ></View>
              : null
          }
          <Text 
            style={{ 
              fontSize: 14,
              color: '#999',
              lineHeight: 28
            }}
          >{
              [
                username, 
                getDate(new Date(created_date)), 
                (updated_date ? '更新' : MIND_TYPES[type_id].action) + '了', 
                MIND_TYPES[type_id].name
              ].join(' ')
            }</Text>
        </View>
        <View>
          <Text style={{ 
            marginTop: 5,
            fontSize: 16,
            color: '#333',
            lineHeight: 24
            }}>{text}</Text>
        </View>
        {
          column_id === 'sentence' && is_extract 
            ? <TouchableOpacity
                onPress={() => {
                  let { content, expand, summary } = this.state
                  if (content) {
                    this.setState({
                      expand: !expand,
                      text: expand ? summary : content
                    })
                  } else {
                    this.setState({
                      loading: true
                    }, () => {
                      this.loadMind(_id)
                    })
                  }
                }}
                style={{
                  marginTop: 5
                }}
              >
                <Text
                  style={{
                    color: '#666'
                  }}
                >{content && expand ? '收起' : '展开全文'}</Text>
              </TouchableOpacity> 
            : null
          }
        <View style={{
          marginTop: 5,
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}>
          <TouchableOpacity
            style={{
              padding: 10
            }}
            onPress={this.mindComment}
            /* onPress={() => onReply({ 
              replyType: 'mind', 
              replyId: _id,
              parentId: _id,
              receiverId: creator_id 
            })} */
          >
            <Text style={{ 
            fontSize: 14,
            color: '#666',
            }}>回复</Text>
          </TouchableOpacity>
        </View>
        <View style={{
          marginTop: 5,
          backgroundColor: '#f3f4f5',
          borderRadius: 3,
          marginBottom: 10
        }}>
          {/*replies.map((reply, index) => {
            const replyName = (reply.remark && reply.remark[0] || reply.username || '')
            return <ReplyItem 
              key={reply._id}
              reply={reply}
              curUserId={curUserId}
              navigation={navigation}
              onShowAction={() => this.showActionModal(reply._id, index)}
              onReply={() => onReply({ 
                replyType: 'reply', 
                replyId: reply._id,
                parentId: _id,
                receiverId: reply.creator_id,
                receiverName: replyName
              })}
            />
          })*/}
          {/*this.moreButton(_id, reply_count)*/}
        </View>
      </View>
    )
  }
}

class Talk extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      friendTotal: 0,
      refreshing: false,
      helps: [],
      loading: true,
      page: 1,
      reply: '',
      replyVisible: false,
      replyData: null,
      btnDis: true,
    }
    props.navigation.setParams({
      component: this
    })
  }

  static navigationOptions = {
    title: '谈心'
  }

  removeReply = (helpIndex, replyIndex) => {
    let { helps } = this.state
    let help = helps[helpIndex]
    let replies = help.replies
    replies.splice(replyIndex, 1)
    this.setState({
      helps
    })
  }

  async replyConfirm() {
    this._replyInput && this._replyInput.blur()
    const data = Object.assign(this.state.replyData, { content: this.state.reply })
    const { content, replyId, replyType, parentId, receiverId } = data
    let res = await post(`${replyType}/${replyId}/reply`, { 
      content,
      parent_id: parentId,
      parent_type: 'mind',
      receiver_id: receiverId
    })
    if (res) {
      const { success } = res
      let { helps } = this.state
      if (success) {
        let user = getUserByMemory()
        let help = helps.find(item => item._id === parentId)
        let { reply } = res
        reply.username = user.username
        if (replyType === 'reply') {
          let replyTo = help.replies.find(item => item._id === replyId)
          reply.receivername = replyTo.remark[0] || replyTo.username[0] || ''
        }
        if (help) {
          help.reply_count += 1
          help.replies.unshift(reply)
          this.setState({
            helps
          })
        }
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

  setModalVisible(visible) {
    this.setState({
      modalVisible: visible
    })
  }

  inputBlur() {
    if (this.state.replyVisible) {
      this.setState({ replyVisible: false })
    }
  }

  layoutData(data) {
    let { 
      success, 
      friendTotal,
      pageInfo,
      helps = [], 
    } = data
    if (success) {
      this.setState({
        page: pageInfo.nextPage || 0,
        helps: [...this.state.helps, ...helps],
        friendTotal,
      })
    }
  }

  async loadData() {
    const { page, loading, refreshing } =  this.state
    let data = await get('features/help', {
      perPage: 20,
      page,
      isVisit: refreshing
    })
    if (loading) {
      this.setState({
        loading: false,
        refreshing: false,
      }, () => {
        data && this.layoutData(data)
      })
    }
    if (refreshing) {
      this.setState({
        refreshing: false,
        helps: []
      }, () => {
        data && this.layoutData(data)
      })
    }
  }

  refresh = () => {
    this.setState({
      page: 1,
      refreshing: true
    }, () => {
      this.loadData()
    })
  }

  reload() {
    this.setState({
      page: 1,
      loading: true,
      helps: []
    }, () => {
      this.loadData()
    })
  }

  loadMore = () => {
    const { page, loading } = this.state
    if (!page || loading) return
    this.setState({
      loading: true 
    }, () => {
      this.loadData()
    })
  }

  newMindsReaded(message, karmaMsg, curMsg) {
    this.refresh()
    if (curMsg) {
      curMsg.mind_total = 0
      if (curMsg.reply_total === 0) {
        karmaMsg.has_new = false
        curMsg.has_new = false
      }
      this.props.layoutHomeData({
        message: message
      })
    }
  }

  componentWillMount() {
    let query = msg => msg.feature === 'karma'
    let message = [...this.props.homeData.message]
    let karmaMsg = message.find(query)
    let karmaMsgs = karmaMsg && karmaMsg.sub_feature || []
    let curMsg = karmaMsgs.find(msg => msg.feature === 'talk')
    if (!curMsg || !curMsg.mind_total) {
      this.loadData()
    }
  }

  componentDidMount() {
    this._foucsHandle = this.props.navigation.addListener('didFocus', () => {
      let query = msg => msg.feature === 'karma'
      let message = [...this.props.homeData.message]
      let karmaMsg = message.find(query)
      let karmaMsgs = karmaMsg && karmaMsg.sub_feature || []
      let curMsg = karmaMsgs.find(msg => msg.feature === 'talk')
      if (curMsg && curMsg.mind_total) {
        this.newMindsReaded(message, karmaMsg, curMsg)
      }
    })
  }

  componentWillUnmount() {
    this._foucsHandle.remove()
  }

  componentDidUpdate(prevProps, state) {
    let { replyVisible } = state
    if (this.state.replyVisible && replyVisible !== this.state.replyVisible) {
      this._replyInput.focus()
    }
  }

  componentWillReceiveProps(nextProps) {
    let query = msg => msg.feature === 'karma'
    let newMessage = [...nextProps.homeData.message]
    let newKarmaMsg = newMessage.find(query)
    let curKarmaMsg = this.props.homeData.message.find(query)
    let newKarmaMsgs = newKarmaMsg && newKarmaMsg.sub_feature || []
    let curKarmaMsgs = curKarmaMsg && curKarmaMsg.sub_feature || []
    let newMsg = newKarmaMsgs.find(msg => msg.feature === 'talk')
    let curMsg = curKarmaMsgs.find(msg => msg.feature === 'talk')

    if (newMsg && newMsg.mind_total) {
      if (nextProps.navigation.isFocused()) {
        this.newMindsReaded(newMessage, newKarmaMsg, newMsg)
      }
      return
    }

    if (nextProps.loginData.userId !== this.props.loginData.userId ||
      (newMsg && newMsg.reply_total || 0) !== (curMsg && curMsg.reply_total || 0)) {
      this.reload()
    }
  }

  render() {
    let { 
      friendTotal,
      helps, 
      refreshing, 
      loading, 
      page,
      replyVisible,
      reply,
      replyData
    } = this.state
    const { loginData, homeData, navigation } = this.props
    const { receiverName = '' } = replyData || {}
    const { userId = '' } = loginData
    let { message } = homeData
    message = [...message]
    let karmaMsg = message.find(msg => msg.feature === 'karma')
    let karmaMsgs = karmaMsg && karmaMsg.sub_feature || []
    let curMsg = karmaMsgs.find(msg => msg.feature === 'talk')
    let replyMsgCount = curMsg && curMsg.reply_total || 0

    return (
      <View
        style={globalStyles.container}
      >
        <View
          style={{ flex: 1 }}
        >
        {
          helps && helps.length 
            ? 
              <FlatList
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                /*contentContainerStyle={{
                  padding: 10
                }}*/
                data={helps}
                refreshing={refreshing}
                onRefresh={this.refresh}
                onEndReached={this.loadMore}
                onEndReachedThreshold={100}
                renderItem={({item, index}) => <HelpItem 
                  curReply={item}
                  curUserId={userId}
                  msgCount={replyMsgCount}
                  onRemoveMsgTips={() => {
                    console.log('消息全部已读')
                    message = [...message]
                    let karmaMsg = message.find(msg => msg.feature === 'karma')
                    let karmaMsgs = karmaMsg && karmaMsg.sub_feature || []
                    let curMsg = karmaMsgs.find(msg => msg.feature === 'talk')
                    if (curMsg) {
                      curMsg.has_new = false
                      curMsg.reply_total = 0
                      karmaMsg.has_new = false
                      karmaMsg.mind_total = 0
                      this.props.layoutHomeData({
                        message: message
                      })
                    }
                  }}
                  navigation={this.props.navigation}
                  onReply={this.onReply.bind(this)} 
                  onShowActionModal={(onRemoveReply) => this._modal.open('ActionSelect', {
                    onRemoveReply: () => onRemoveReply(index)
                  })}
                  onRemove={this.removeReply}
                  {...item} 
                />}
                ListFooterComponent={<Footer 
                  data={helps} 
                  onLoadMore={this.loadMore} 
                  loading={loading}
                  page={page}
                />}
                ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
                keyExtractor={(item) => (item._id)}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              />
            : (
                !loading 
                  ? <TalkEmptyGuide 
                      navigation={navigation}
                      friendTotal={friendTotal} 
                      refreshing={refreshing}
                      onRefresh={this.refresh}
                    /> 
                  : <Empty loading={true} />
              )
          }
        </View>
        {
          replyVisible 
            ? <KeyboardAvoidingView
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
                  onBlur={() => this.inputBlur()}
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
          : null
        }
        <ActionModal 
          navigation={this.props.navigation}
          ref={ ref => this._modal = ref }
        />
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  const { loginData, homeData } = state
  return { loginData, homeData }
}

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    layoutHomeData,
  }, dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(Talk)
