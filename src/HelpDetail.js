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
  Alert
} from 'react-native'
import { connect } from 'react-redux'
import { get, post, del, getUserByMemory } from 'app/component/request'
import { STATUS_BAR_HEIGHT, MIND_TYPES, EMOTION } from 'app/component/Const'
import Quote, { QuoteItem } from 'app/component/Quote'
import Back from 'app/component/Back'
import { Footer } from 'app/component/ListLoad'
import { Spinner } from 'app/component/GlobalModal'
import { createFriendModal } from 'app/component/GlobalModal'
import globalStyles from 'app/component/globalStyles'
import ActionSelect from 'app/Karma/ActionSelect'

const ActionModal = createFriendModal({
  ActionSelect,
  Quote
})

let noDataTips = '当前没有评论'
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
    , { 
      _id, 
      creator_id, 
      content = '',
      type,
      sub_type,
      author,
      friend,
      receiver,
      friend_receiver,
      reply_type, 
      curUserId,
      onReply,
      onShowAction,
      quote,
      navigation
    } = this.props
    , isAuthorSelf = author && author._id === curUserId
    , minename = '我'
    , creatorname = isAuthorSelf ? minename : (friend && friend.remark) || (author && author.nickname) || ''
    , isReceiverSelf = receiver && receiver._id === curUserId
    , receivername = isReceiverSelf ? minename : (friend_receiver && friend_receiver.remark) || (receiver && receiver.nickname) || ''
    , replyContent = type === 'emotion' ? EMOTIONS[sub_type] + '了' + (isReceiverSelf ? '你' : '他') : (type === 'text' ? content : '')
    return (
      <Animated.View style={rowStyles}>
        <TouchableOpacity
          key={_id}
          style={{
            padding: 10
          }}
          onPress={
            isAuthorSelf 
            ? () => onShowAction()
            : () => {
              let data = { 
                replyType: 'reply', 
                replyId: _id,
                receiverId: creator_id,
                receiverName: creatorname
              }
              onReply(data)
            }}
        >
          <Text style={{
            fontSize: 14,
            lineHeight: 24,
            color: '#333'
          }}>
            {creatorname + (reply_type === 'reply' ? '@' + receivername : '') + '：' + replyContent}
          </Text>
          <QuoteItem 
            quote={quote}
            navigation={navigation}
          />
        </TouchableOpacity>
      </Animated.View>
    )
  }
}

class DetailView extends Component {

  constructor(props) {
    super(props)
    let { help } = props,
    { isThanked } = help
    this.state = {
      isThanked,
      thanking: false
    }
  }

  async removeMind(id) {
    const res = await del(`mind/${id}`)
    if (res.success) {
      // TODO 删除后效果
      // this.onRemove()
      this.props.navigation.goBack()
      this.props.navigation.state.params.onBackRemove();
    }
  }

  async thank() {
    let { isThanked, thanking } = this.state
    , { help } = this.props
    if (!isThanked && !thanking) {
      this.setState({
        thanking: true,
        isThanked: true
      })
      try {
        await post(`thank/${help._id}`, {
          typeId: EMOTION[help.type_id].good.id
        })
        this.setState({
          thanking: false,
          isThanked: true
        })
      } catch (err) {
        this.setState({
          thanking: false,
          isThanked: false
        })
      }
    }
  }

  async cancelThank(mindId) {
    let { isThanked, thanking } = this.state
    , { help } = this.props
    if (isThanked && !thanking) {
      this.setState({
        thanking: true,
        isThanked: false
      })
      try {
        await del(`thank/${help._id}`)
        this.setState({
          thanking: false,
          isThanked: false
        })
      } catch (err) {
        this.setState({
          thanking: false,
          isThanked: true
        })
      }
    }
  }

  render() {
    let { 
      help, 
      isCreator, 
      navigation,
      onReply,
      onQuote
    } = this.props
    , { 
      _id,
      title, 
      perm_id,
      type_id,
      content, 
      friend, 
      author, 
      creator_id,
      quote
    } = help
    , { isThanked } = this.state
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
          {title ? (<View style={{
            flex: 1,
            padding: 10,
          }}>
            <Text
              selectable={isCreator}
              onLongPress={isCreator ? null : () => {
                Alert.alert('', '内容关系作者权益，禁止拷贝，请谅解。', [
                  {text: '确定'}
                ])
              }}
              style={{
                fontSize: 20,
                lineHeight: 42,
                textAlign: 'center'
              }}
            >{title}</Text>
          </View>) : null}
          <Text
            selectable={isCreator}
            onLongPress={isCreator ? null : () => {
              Alert.alert('', '内容关系作者权益，禁止拷贝，请谅解。', [
                {text: '确定'}
              ])
            }}
            style={{
              fontSize: 16,
              lineHeight: 36,
              color: '#333333',
            }}
          >{content || ''}</Text>
          <QuoteItem 
            quote={quote}
            navigation={navigation}
          />
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
              let type = isCreator ? 'follow' : 'comment'
              onReply(type)
            }}
          >
            <Text style={{ 
              fontSize: 14,
              color: '#999',
            }}>{isCreator ? '跟进' : '回复'}</Text>
          </TouchableOpacity>
          {
            isCreator
              ? <TouchableOpacity
                  style={{
                    padding: 10
                  }}
                  onPress={() => this.removeMind(_id)}
                >
                  <Text style={{ 
                  fontSize: 14,
                  color: '#999'
                  }}>{help.type_id === 'help' ? '已解' : '删除'}</Text>
                </TouchableOpacity>
              : null
          }
          {!isCreator ? 
              <TouchableOpacity
                style={{
                  padding: 10
                }}
                onPress={
                  isThanked 
                    ? () => this.cancelThank()
                    : () => this.thank()
                  }
              >
                <Text 
                  style={{
                    color: '#999', 
                    fontSize: 14
                  }}
                >{(isThanked ? '已' : '') + EMOTION[type_id].good.name}</Text>
              </TouchableOpacity>
            : null  
          }
          {
            perm_id !== 'me'
              ? <TouchableOpacity
                  style={{
                    padding: 10
                  }}
                  onPress={onQuote}
                >
                  <Text style={{ 
                  fontSize: 14,
                  color: '#999',
                  }}>{isCreator ? '分享到' : '引用'}</Text>
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
    let { navigation } = props
    this._mindId = navigation.getParam('itemId')
    this._defaultReplyData = null
    this.state = {
      help: null,
      loading: true,
      noDataTips,
      refreshing: false,
      replyData: null,
      reply: '',
      needAutoFocus: false
    }
  }

  replyConfirm() {
    // 获取回复数据
    const { 
      replyData, 
      reply 
    } = this.state
    , data = Object.assign(
      replyData || this._defaultReplyData, { 
        content: reply 
      }
    )
    , { 
      content, 
      replyId, 
      replyType, 
      parentId, 
      receiverId 
    } = data

    // 清理回复框并发送回复
    this.setState({
      reply: '',
      replyData: null
    }, async () => {
      // 界面上添加回复项
      let { help } = this.state
      , type_map = {
        follow: 'mind',
        comment: 'mind',
        reply: 'reply'
      }
      , reply_type = type_map[replyType]
      , reqParams = { 
        content,
        parent_id: parentId,
        parent_type: 'mind',
        reply_type,
        receiver_id: receiverId
      }
      , newReply = Object.assign({}, reqParams)
      if (help) {
        let replies = help.replies || []
        , user = getUserByMemory()
        , key = replies.length
        newReply._id = 'newreply' + key
        newReply.author = user
        newReply.friend = null
        newReply.reply_id = replyId
        newReply.reply_type = reply_type
        newReply.creator_id = user._id
        if (replyType === 'reply') {
          let replyTo = help.replies.find(item => item._id === replyId)
          , { friend, author } = replyTo
          newReply.friend_receiver = friend
          newReply.receiver = author
        }
        replies.unshift(newReply)
        this.setState({
          help
        })
      }

      // 向服务器发送回复
      const res = await post(
        `${replyType}/${replyId}/reply`, 
        reqParams
      )
      if (res) {
        const { success, reply } = res
        if (success && reply) {
          newReply._id = reply._id
          this.setState({
            help
          })
        }
      }
    })
  }

  onReply(data) {
    this.setState({
      reply: '',
      replyData: data || null
    }, () => {
      this._replyInput.focus()
    })
  }

  refresh = () => {
    this.setState({
      refreshing: true
    }, () => {
      this.loadData()
    })
  }

  async loadData() {
    let data = await get(`help/${this._mindId}`)
    if (data) {
      let { navigation } = this.props
      , action = navigation.getParam('action')
      , passData = navigation.getParam('data') || null
      , isMindType = ['follow', 'comment'].indexOf(action) !== -1
      , { help } = data
      // 配置默认回复内容
      this._defaultReplyData = isMindType
        ? Object.assign({
            replyType: action,
            replyId: help._id,
            parentId: help._id,
            receiverId: help.creator_id 
          }, passData)
        : null
      this.setState({
        help,
        loading: false,
        needAutoFocus: !!action,
        replyData: action === 'reply' ? Object.assign({
          replyType: action
        }, passData) : this._defaultReplyData 
      })
    }
  }

  componentWillMount() {
    this.loadData()
  }

  removeReply(id, index) {
    let { help } = this.state
    let { replies } = help
    replies.splice(index, 1)
    this.setState({
      replies
    }, async () => {
      // TODO 删除中loading...效果
      const res = await del(`reply/${id}`)
      if (res.success) {
        // TODO 删除后状态提示
      }
    })
  }

  showActionModal(id, index) {
    this._modal.open('ActionSelect', {
      onRemoveReply: () => this.removeReply(id, index)
    })
  }

  render() {
    let { 
      noDataTips, 
      help, 
      reply, 
      refreshing, 
      loading,
      needAutoFocus
    } = this.state
    const { replyType = '', receiverName = '' } = this.state.replyData || {}
    const { navigation, loginData } = this.props
    const { userId = '' } = loginData
    let replyTips = ''
    switch (replyType) {
      case 'follow':
        replyTips = '跟进...'
        break
      case 'comment':
        replyTips = '回复...'
        break
      case 'reply':
        replyTips = '回复' + receiverName
        break
    }
    if (help) {
      let { 
        _id,
        title, 
        content, 
        type_id,
        creator_id,
        author,
        friend,
        replies
      } = help
      , isCreator = creator_id === userId
      , creatorname = isCreator ? '我' : (friend && friend.remark) || (author && author.nickname) || ''
      , headTitle = [creatorname, MIND_TYPES[type_id].name].join('的')

      return (
        <View 
          style={{ flex: 1 }}
        >
          {/*<Spinner
            visible={true}
            textStyle={{
              color: '#333'
            }}
            color='#666'
            overlayColor='rgba(255,255,255, 0.25)'
          />*/}
          <Back 
            name={headTitle}
            navigation={navigation} 
          />
          <FlatList
              contentContainerStyle={{
                paddingHorizontal: 15,
                paddingBottom: 15
              }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              data={replies}
              refreshing={refreshing}
              onRefresh={this.refresh}
              ListHeaderComponent={
                <DetailView 
                  isCreator={isCreator} 
                  navigation={navigation}
                  help={help} 
                  onReply={type => this.onReply(
                    Object.assign({}, this._defaultReplyData, {
                      replyType: type
                    })
                  )}
                  onQuote={() => this._modal.open('Quote', {
                    classic: help,
                    quoteType: 'mind',
                    feature: isCreator ? 'mind' : 'talk'
                  })}
                />
              }
              renderItem={({item, index}) => <ReplyItem 
                navigation={navigation}
                onReply={data => {
                  data.parentId = help._id
                  this.onReply(data)
                }} 
                curUserId={userId}
                onShowAction={() => this.showActionModal(item._id, index)}
                {...item}
              />}
              ListEmptyComponent={() => 
                <View>
                  <Text style={{
                    color: '#333333',
                    textAlign: 'center',
                    paddingTop: 20
                  }}>
                    {noDataTips}
                  </Text>
                </View>
              }
              /*
                TODO 增加分页
                ListFooterComponent={<Footer 
                data={replies} 
                onLoadMore={this.loadMore} 
                loading={loading}
                page={page}
              />}*/
              ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
              keyExtractor={(item) => (item._id)}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            />
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
                  padding: 10,
                  borderRadius: 3,
                  backgroundColor: 'white',
                  marginRight: 8
                }}
                placeholder={replyTips}
                placeholderTextColor="#cccccc"
                allowFontScaling={false}
                autoCapitalize="none"
                underlineColorAndroid='transparent'
                onChangeText={text => this.setState({ reply: text })}
                value={reply}
                autoFocus={needAutoFocus}
                multiline={true}
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
              refReply={(help, classic, quoteType) => {
                this.props.navigation.navigate('QuoteEditor', {
                  type: 'reply',
                  help,
                  classic,
                  quoteType
                })
              }}
            />
        </View>
      )
    } else {
      return loading
        ? <View style={{ flex: 1 }}>
            <Back navigation={this.props.navigation} />
            <Text style={globalStyles.noDataText}>加载中...</Text>
          </View>
        : <View style={{ flex: 1 }}>
            <Back navigation={this.props.navigation} />
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this.refresh}
                />
              }
              contentContainerStyle={{
                flex: 1,
                padding: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              <Text style={globalStyles.noDataText}>您查看的内容已被删除。</Text>
            </ScrollView>
          </View>
    }
  }
}

const mapStateToProps = (state) => {
  const { loginData } = state
  return { loginData }
}

export default connect(mapStateToProps)(HelpDetail)
