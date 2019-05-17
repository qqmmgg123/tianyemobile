/**
 * 心模块列表
 */
import React from 'react'
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  Text, 
  Animated, 
  ScrollView, 
  RefreshControl
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from 'app/HomeActions'
import { get, del } from 'app/component/request'
import { getDate } from 'app/utils'
import { createFriendModal } from 'app/component/GlobalModal'
import { Empty, Footer } from 'app/component/ListLoad'
import { 
  ANIMATION_DURATION,
  MIND_TYPES, 
  PERM_TYPES, 
  EMOTIONS 
} from 'app/component/Const'
import globalStyles from 'app/component/globalStyles'
import TYicon from 'app/component/TYicon'
import Quote, { QuoteItem } from 'app/component/Quote'
import TypeSelect from 'app/Mind/TypeSelect'

class MindItem extends React.Component {

  constructor(props) {
    super(props)
    this._readed = 0
    this._animated = new Animated.Value(1)
    const { curReply } = props
    , { summary } = curReply
    this.state = {
      loading: false,
      curReply,
      text: summary,
      content: '',
      summary,
      expand: false
    }
  }

  // 删除
  async removeMind(id) {
    const res = await del(`mind/${id}`)
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

  mindModify = () => {
    const { _id } = this.state.curReply
    this.props.navigation.navigate('MindEditor', {
      itemId: _id,
      onListRefresh: this.props.onListRefresh,
      onListReload: this.props.onListReload
    })
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
                fontSize: 12,
                color: '#ccc',
                marginLeft: 10,
                flex: 1
              }}
            >{creatorname + EMOTIONS[sub_type] + '了你'}</Text>
            <Text
              style={{
                fontSize: 12,
                color: '#ccc',
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
                this.mindDetailShow('reply', replyData)
              }}
            >
              <Text 
                style={{ 
                  fontSize: 12,
                  color: '#ccc',
                }}
              >回复</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )
    }
  }

  render() {
    const rowStyles = [
      { opacity: this._animated }
    ]
    , { 
      text, 
      content, 
      expand, 
      curReply 
    } = this.state
    , { curUserId, navigation, onQuote } = this.props
    , { 
      _id, 
      type_id, 
      title = '', 
      column_id, 
      creator_id,
      new_reply, 
      quote, 
      perm_id,
      is_extract, 
      created_date, 
      updated_date, 
    } = curReply

    // 权限提示
    let permTips = (PERM_TYPES[perm_id] && PERM_TYPES[perm_id].name || '') + '可见'
    // 头部信息
    , mindType = MIND_TYPES[type_id]
    , date = updated_date || created_date || ''
    , { action } = MIND_TYPES[type_id]
    date && (date = getDate(new Date(date)))
    let activity = date + action

    let header = (
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
            fontSize: 12,
            color: '#ccc',
            flex: 1
          }}
        >
          {mindType.name + mindType.icon}
        </Text>
        <Text
          style={{ 
            fontSize: 12,
            color: '#ccc',
          }}
        >
          {activity}
        </Text>
      </View>
    )

    return (
      <Animated.View style={rowStyles}>
        <TouchableOpacity 
          style={{
            padding: 10,
            backgroundColor: 'white'
          }}
          activeOpacity={1}
          // 跟进和编辑切换
          onPress={
            new_reply 
              ? () => this.mindDetailShow('follow') 
              : this.mindModify
          }
        >
          {header}
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
                    fontSize: 12,
                    color: '#ccc'
                  }}
                >{content && expand ? '收起' : '展开全文'}</Text>
              </TouchableOpacity> 
            : null
          }
          <QuoteItem 
            quote={quote}
            navigation={navigation}
          />
          <View 
            style={{
              marginTop: 5,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <View
              style={{
                flex: 1
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: '#ccc'
                }}
              >{permTips}</Text>
            </View>
            {
              new_reply 
                ? <TouchableOpacity
                    style={{
                      padding: 10
                    }}
                    onPress={() => this.mindDetailShow('follow')}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#ccc'
                      }}  
                    >跟进</Text>
                  </TouchableOpacity>
                : <TouchableOpacity
                    style={{
                      padding: 10
                    }}
                    onPress={this.mindModify}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#ccc'
                      }}
                    >编辑</Text>
                  </TouchableOpacity>
            }
            {
              !new_reply && type_id !== 'diary' 
                ? <TouchableOpacity
                    style={{
                      padding: 10
                    }}
                    onPress={() => this.mindDetailShow('follow')}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#ccc'
                      }}  
                    >跟进</Text>
                  </TouchableOpacity> 
                : null
            }
            {
              curUserId && curUserId === creator_id
              ? (<TouchableOpacity
                    style={{
                      padding: 10
                    }}
                    onPress={() => this.removeMind(_id)}
                  >
                    <Text style={{ 
                      fontSize: 12,
                      color: '#ccc'
                    }}>{type_id === 'help' ? '已解' : '删除'}</Text>
                  </TouchableOpacity>)
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
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#ccc'
                      }}  
                    >分享到</Text>
                  </TouchableOpacity>
                : null
            }
          </View>
          {this.newReplyNoticeBar}
        </TouchableOpacity>
      </Animated.View>
    )
  }
}

const MindModal = createFriendModal({
  TypeSelect,
  Quote
})

class MindList extends React.Component {

  constructor(props) {
    super(props)
    this._dropdowns = []
    this.state = {
      refreshing: false,
      loading: true,
      minds: [],
      page: 1
    }
  }

  newMind = (id) => {
    this.props.navigation.navigate('MindEditor', {
      itemTypeId: id,
      itemId: '',
      onListRefresh: this.refresh
    })
  }

  layoutData(data) {
    let { 
      appName, 
      slogan, 
      features, 
      success, 
      pageInfo,
      minds = []
    } = data
    if (success) {
      this.props.layoutHomeData({
        appName,
        slogan,
        features
      })
      this.setState({
        page: pageInfo.nextPage || 0,
        minds: [...this.state.minds, ...minds],
      })
    }
  }

  async loadData() {
    const { page, loading, refreshing } =  this.state
    let data = await get('mind', {
      perPage: 20,
      page
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
        minds: []
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

  reload = () => {
    this.setState({
      page: 1,
      loading: true,
      minds: []
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

  removeItem(index) {
    let { minds } = this.state
    minds.splice(index, 1)
    this.setState({
      minds
    })
  }

  componentWillMount() {
    this.loadData()
  }

  componentWillReceiveProps(nextProps) {
    let query = msg => msg.feature === 'mind'
    let newMsg = nextProps.homeData.message.find(query)
    let curMsg = this.props.homeData.message.find(query)
    if ((nextProps.loginData.userId && (nextProps.loginData.userId !== this.props.loginData.userId)) ||
      (newMsg && newMsg.total || 0) !== (curMsg && curMsg.total || 0)) {
      this.reload()
    }
  }

  render() {
    let { homeData, loginData, navigation } = this.props
    , { features, message } = homeData
    , { userId = '' } = loginData
    , { routeName } = navigation.state
    , title = features && features[routeName.toUpperCase()] || ''
    , { 
      minds, 
      refreshing, 
      loading, 
      page,
    } = this.state

    message = [...message]
    let curMsg = message.find(msg => msg.feature === 'mind')
    , msgCount = curMsg && curMsg.total || 0
    
    return (
      <View 
        style={[globalStyles.container, {
          zIndex: 0
        }]}
      >
        <View style={globalStyles.header}>
          <Text style={globalStyles.logo}>{ title }</Text>
          <TouchableOpacity
            onPress={() => this._modal.open('TypeSelect')}
            style={{
              padding: 10
            }}
          >
            <TYicon 
              style={{
                marginRight: 10
              }}
              name='tianjiaguanzhu' 
              size={18} 
              color='#666'></TYicon>
          </TouchableOpacity>
        </View>
        {minds && minds.length ? <FlatList
          contentContainerStyle={{
            paddingVertical: 10
          }}
          data={minds}
          refreshing={refreshing}
          onRefresh={this.refresh}
          onEndReached={this.loadMore}
          onEndReachedThreshold={100}
          renderItem={({item, index}) => <MindItem
            navigation={navigation}
            modal={this._modal}
            curReply={item}
            curUserId={userId}
            msgCount={msgCount}
            onListRefresh={this.refresh}
            onListReload={this.reload}
            onRemoveMsgTips={() => {
              console.log('消息全部已读')
              let { message } = this.props.homeData
              message = [...message]
              let curMsg = message.find(msg => msg.feature === 'mind')
              if (curMsg) {
                curMsg.has_new = false
                curMsg.total = 0
                this.props.layoutHomeData({
                  message: message
                })
              }
            }}
            onRemove={this.removeItem.bind(this, index)} 
            onRefresh={() => this.refresh()}
            onQuote={() => this._modal.open('Quote', {
              classic: item,
              quoteType: 'mind',
              feature: 'mind'
            })}
          />}
          ListFooterComponent={<Footer 
            data={minds} 
            onLoadMore={this.loadMore} 
            loading={loading}
            page={page}
          />}
          ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
          keyExtractor={item => (item._id)}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        /> : (!loading ? (<ScrollView 
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
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
          <Text style={{
            fontSize: 16,
            color: '#999',
            textAlign: 'center',
            lineHeight: 28
          }}>
            在这里，您可以~
          </Text>
          <View>
            {Object.entries(MIND_TYPES).map(([id, guide]) => (
              <TouchableOpacity
                key={id}
                style={{
                  marginTop: 20
                }}
                onPress={this.newMind.bind(this, id)}
              >
                <View>
                  <Text style={{
                    textAlign: 'center',
                    fontSize: 20
                  }}>{guide.action + guide.name + guide.icon}</Text>
                </View>
                <View style={{
                  marginTop: 10
                }}>
                  <Text style={{
                    color: '#666',
                    fontSize: 16,
                    lineHeight: 24,
                    textAlign: 'center',
                    width: 200,
                  }}>{guide.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>) : <Empty loading={true} />)}
        <MindModal 
          ref={ref => this._modal = ref}
          navigation={navigation}
          onChangeType={(type_id) => {
            this.newMind(type_id)
            this._modal.close()
          }}
          refReply={(help, classic, quoteType) => {
            navigation.navigate('QuoteEditor', {
              type: 'reply',
              help,
              classic,
              quoteType
            })
          }}
        />
      </View>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(MindList)
