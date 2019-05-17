/**
 * 缘——谈心模块
 */
import React from 'react'
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  Text, 
  Animated
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from 'app/HomeActions'
import { get, post, del } from 'app/component/request'
import { Empty, Footer } from 'app/component/ListLoad'
import { MIND_TYPES, EMOTION, EMOTIONS } from 'app/component/Const'
import { getDate } from 'app/utils'
import { createFriendModal } from 'app/component/GlobalModal'
import Quote, { QuoteItem } from 'app/component/Quote'
import globalStyles from 'app/component/globalStyles'
import TalkEmptyGuide from 'app/Friend/TalkEmptyGuide'

const TalkModal = createFriendModal({ 
  Quote
})

class HelpItem extends React.Component {

  constructor(props) {
    super(props)
    this._readed = 0
    this._animated = new Animated.Value(1)
    const { curReply } = props
    const { summary } = curReply
    this.state = {
      loading: false,
      curReply,
      text: summary,
      content: '',
      summary,
      expand: false
    }
  }

  async loadMind(mindId) {
    let data = await get(`mind/${mindId}`)
    if (data) {
      let { mind } = data
      , { content } = mind
      this.setState({
        content: content,
        text: content,
        expand: true,
        loading: false
      })
    }
  }

  mindDetailShow(action, replyData) {
    const { msgCount, onRemoveMsgTips, navigation } = this.props
    , { curReply } = this.state
    , { _id } = curReply
    navigation.navigate('HelpDetail', {
      itemId: _id,
      action: action,
      data: replyData,
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

  async thank() {
    let { curReply } = this.state
    mind = Object.assign({}, curReply)
    if (!mind.isThanked && !mind.thanking) {
      mind.thanking = true
      mind.isThanked = true
      this.setState({
        curReply: mind
      })
      try {
        await post(`thank/${mind._id}`, {
          typeId: EMOTION[mind.type_id].good.id
        })
        mind.thanking = false
        mind.isThanked = true
      } catch (err) {
        mind.thanking = false
        mind.isThanked = false
      }
      this.setState({
        curReply: mind
      })
    }
  }

  async cancelThank() {
    let { curReply } = this.state
    mind = Object.assign({}, curReply)
    if (mind.isThanked && !mind.thanking) {
      mind.thanking = true
      mind.isThanked = false
      this.setState({
        curReply: mind
      })
      try {
        await del(`thank/${mind._id}`)
        mind.thanking = false
        mind.isThanked = false
      } catch (err) {
        mind.thanking = false
        mind.isThanked = true
      }
      this.setState({
        curReply: mind
      })
    }
  }

  // 回复提示
  get newReplyNoticeBar() {
    let mind = this.state.curReply
    , { new_reply, new_reply_date, reply_visit_date } = mind
    , hasNew = new_reply_date > reply_visit_date

    if (new_reply && hasNew) {
      let mindId = mind._id
      , {
        _id,
        author, 
        friend, 
        sub_type,
        created_date
      } = new_reply
      , newReplyId = _id
      , creatorname = (friend && friend.remark) || (author && author.nickname) || ''
      , replyData = { 
        parentId: mindId, 
        replyId: newReplyId,
        receiverId: author && author._id,
        receiverName: (friend && friend.remark) || (author && author.nickname)
      }
        
      return (
        <TouchableOpacity
          style={{
            padding: 10,
            arginTop: 5,
            backgroundColor: '#f3f4f5',
            borderRadius: 3,
            marginTop: 10,
            marginBottom: 10
          }}
          onPress={() => {
            this.mindDetailShow('reply', replyData)
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 5
            }}
          >
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#EE3D80'
            }}></View>
            <Text
              style={{
                fontSize: 14,
                color: '#999',
                marginLeft: 10,
                flex: 1
              }}
            >{creatorname + EMOTIONS[sub_type] + '了你'}</Text>
            <Text
              style={{
                fontSize: 14,
                color: '#999',
              }}
            >{getDate(new Date(created_date))}</Text>
          </View>
          {
            new_reply.sub_type === 'text'
              ? 
                <Text 
                  style={{
                    fontSize: 14,
                    lineHeight: 24,
                    color: '#333'
                  }}
                  numberOfLines={2}
                >
                  {new_reply.content || ''}
                </Text>
              : null
          }
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end'
            }}
          >
            <TouchableOpacity
              style={{
                padding: 10
              }}
              onPress={() => {
                this.mindDetailShow('reply',replyData)
              }}
            >
              <Text 
                style={{ 
                  fontSize: 14,
                  color: '#999',
                }}
              >回复</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )
    }
  }

  render() {
    const { 
      text, 
      content, 
      expand, 
      curReply 
    } = this.state
    , { navigation, onQuote } = this.props
    , { 
      _id, 
      type_id,
      title = '', 
      column_id,
      author, 
      friend,
      quote,
      is_extract,
      isThanked,
      created_date,
      updated_date
    } = curReply
    , creatorname = (friend && friend.remark) || (author && author.nickname) || ''

    // 头部信息
    let mindType = MIND_TYPES[type_id]
    , date = updated_date || created_date || ''
    , { action } = MIND_TYPES[type_id]
    date && (date = getDate(new Date(date)))
    let activity = date + action

    return (
      <TouchableOpacity 
        style={{
          padding: 10,
          backgroundColor: 'white'
        }}
        activeOpacity={1}
        onPress={() => {
          this.mindDetailShow('comment')
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 10
          }}
        >
          <Text 
            style={{ 
              fontSize: 14,
              color: '#999',
              lineHeight: 28
            }}
          >
            {creatorname + '的' + mindType.name + mindType.icon}
          </Text>
          <Text
            style={{ 
              fontSize: 14,
              color: '#999',
            }}
          >
            {activity}
          </Text>
        </View>
        <View>
          {
            title 
              ?
                <Text 
                  style={{ 
                    fontSize: 16,
                    color: '#333',
                    lineHeight: 24
                  }}
                >
                  {title}
                </Text> 
              : null
          }
          <Text 
            style={{
              fontSize: title ? 14 : 16,
              color: title ? '#999' : '#333',
              lineHeight: 24,
              marginTop: title ? 10 : null
            }}
          >{text}</Text>
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
                    color: '#999'
                  }}
                >{content && expand ? '收起' : '展开全文'}</Text>
              </TouchableOpacity> 
            : null
          }
        <QuoteItem 
          quote={quote}
          navigation={navigation}
        />
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
              this.mindDetailShow('comment')
            }}
          >
            <Text style={{ 
            fontSize: 14,
            color: '#999',
            }}>回复</Text>
          </TouchableOpacity>
          {isThanked
            ? (
              <TouchableOpacity
                style={{
                  padding: 10
                }}
                onPress={() => this.cancelThank()}
              >
                <Text 
                  style={{
                    color: '#999', 
                    fontSize: 14
                  }}
                >已{EMOTION[type_id].good.name}</Text>
              </TouchableOpacity>)
            : (<TouchableOpacity
                  style={{
                    padding: 10
                  }}
                  onPress={() => this.thank()}
                >
                  <Text 
                    style={{ 
                      fontSize: 14,
                      color: '#999'
                    }}
                  >
                    {EMOTION[type_id].good.name}
                  </Text>
                </TouchableOpacity>)}
          <TouchableOpacity
            style={{
              padding: 10
            }}
            onPress={onQuote}
          >
            <Text style={{ 
            fontSize: 14,
            color: '#999',
            }}>引用</Text>
          </TouchableOpacity>
        </View>
        {this.newReplyNoticeBar}
      </TouchableOpacity>
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
    }
    props.navigation.setParams({
      component: this
    })
  }

  static navigationOptions = {
    title: '谈心'
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
    let data = await get('karma/talk', {
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

  // 处理消息显示状态
  newMindsReaded(message, karmaMsg, curMsg) {
    this.refresh()
    if (curMsg) {
      // 处理当前投缘消息小红点
      curMsg.mind_total = 0

      // 处理缘tab消息小红点
      let iskarmaOtherNew = karmaMsg.sub_feature.some(msg => !!msg.total)
      if (curMsg.reply_total === 0) {
        curMsg.has_new = false
        if (!iskarmaOtherNew) {
          karmaMsg.has_new = false
        }
      }

      // 通知消息状态变更
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

    if ((nextProps.loginData.userId && (nextProps.loginData.userId !== this.props.loginData.userId)) ||
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
    } = this.state
    const { loginData, homeData, navigation } = this.props
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
                data={helps}
                refreshing={refreshing}
                onRefresh={this.refresh}
                onEndReached={this.loadMore}
                onEndReachedThreshold={100}
                renderItem={({item, index}) => <HelpItem 
                  curReply={item}
                  curUserId={userId}
                  msgCount={replyMsgCount}
                  onQuote={() => this._modal.open('Quote', {
                    classic: item,
                    quoteType: 'mind',
                    feature: 'talk'
                  })}
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
        <TalkModal 
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
