/**
 * 心模块列表也
 */
import React from 'react'
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  Text, 
  Animated, 
  findNodeHandle,
  ScrollView, 
  RefreshControl
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from 'app/HomeActions'
import { get, del } from 'app/component/request'
import globalStyles from 'app/component/globalStyles'
import TYicon from 'app/component/TYicon'
import { getDate } from 'app/utils'
import { createFriendModal } from 'app/component/GlobalModal'
import PannameEditor from 'app/PannameEditor'
import { Empty, Footer } from 'app/component/ListLoad'
import CardView from 'react-native-rn-cardview'
import { ANIMATION_DURATION, MIND_TYPES } from 'app/component/Const'
import TypeSelect from 'app/Mind/TypeSelect'

let noDataTips = '当前没有内容'

class MindItem extends React.Component {

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

  async removeMind(id) {
    const res = await del(`mind/${id}`)
    if (res.success) {
      this.onRemove()
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

  onRemove = () => {
    const { onRemove } = this.props
    if (onRemove) {
      Animated.timing(this._animated, {
        toValue: 0,
        duration: ANIMATION_DURATION,
      }).start(() => onRemove())
    }
  }

  mindFollow = () => {
    const { msgCount, onRemoveMsgTips } = this.props
    const { curReply } = this.state
    const { _id } = curReply
    this.props.navigation.navigate('HelpDetail', {
      itemId: _id,
      action: 'follow',
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
      onListRefresh: this.refresh
    })
  }

  render() {
    const rowStyles = [
      { opacity: this._animated }
    ]
    const { text, content, expand, curReply } = this.state
    const { curUserId, navigation } = this.props
    const { 
      _id, 
      type_id, 
      title = '', 
      creator_id,
      created_date, 
      updated_date, 
      last_reply_date, 
      reply_visit_date,
      new_reply, 
      quote, 
      column_id, 
      is_extract, 
    } = curReply

    // 动态
    let activity = ''
    let notice = null
    if (created_date) {
      activity = `${getDate(new Date(created_date))}${MIND_TYPES[type_id].action}了`
    }
    if (updated_date) {
      activity = `${getDate(new Date(created_date))}更新了`
    }
    if (last_reply_date && new_reply) {
      const { author, friend } = new_reply
      let creatorname = (friend && friend.remark) || (author && (author.nickname || author.nickname)) || ''
      activity = `${creatorname} ${getDate(new Date(created_date))}回复了你的`
      let hasNew = curUserId !== new_reply.creator_id && last_reply_date > reply_visit_date
      if (hasNew) {
        notice = <View style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#EE3D80',
          marginTop: 8,
          marginRight: 10,
          alignSelf: 'flex-start'
        }}></View>
      }
    }

    let header = <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      {notice}
      <Text 
        style={{
          fontSize: 14,
          color: '#999',
          flex: 1
        }}
      >{[activity, MIND_TYPES[type_id].name].join('')}</Text>
      {
        new_reply 
          ? <TouchableOpacity
              style={{
                padding: 10
              }}
              onPress={this.mindFollow}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: '#666'
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
                  fontSize: 14,
                  color: '#666'
                }}
              >修改</Text>
            </TouchableOpacity>
      }
      {
        (curUserId && curUserId === creator_id)
        && (!last_reply_date && ['share', 'help'].indexOf(type_id) !== -1)
        ? (<TouchableOpacity
              style={{
                padding: 10
              }}
              onPress={() => navigation.navigate('HelpDetail', {
                itemId: _id,
                onBackRemove: () => this.onRemove()
              })}
            >
              <Text style={{ 
              fontSize: 14,
              color: '#666',
              }}>回复</Text>
            </TouchableOpacity>)
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
              fontSize: 14,
              color: '#666'
              }}>{type_id === 'help' ? '已解' : '删除'}</Text>
            </TouchableOpacity>)
        : null
      }
      <TYicon 
        style={{
          marginRight: 10
        }}
        name='gengduo' 
        size={16} 
        color='#666'></TYicon>
    </View>

    return (
      <Animated.View style={rowStyles}>
        <TouchableOpacity 
          style={{
            padding: 10,
            backgroundColor: 'white'
          }}
          activeOpacity={1}
          onPress={new_reply ? this.mindFollow : this.mindModify}
        >
          <View>
            {header}
          </View>
          <View>
            { title ?
              <Text style={{ 
              fontSize: 16,
              color: '#333',
              lineHeight: 24
            }}>{title}</Text> : null
            }
            <Text 
              style={{
                fontSize: title ? 14 : 16,
                color: title ? '#4d4d4d' : '#333',
                lineHeight: 24,
                marginTop: 10
              }}
            >{text}</Text>
          </View>
          {column_id === 'sentence' && is_extract ? <TouchableOpacity
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
          </TouchableOpacity> : null}
          {quote ? <TouchableOpacity
            onPress={() => navigation.navigate('ClassicDetail', {
              itemId: quote._id
            })}
            style={globalStyles.quoteBg}
          >
            <Text
              style={globalStyles.quoteTitle}
              numberOfLines={1}
            >
              {quote.title || ''}
            </Text>
            {/*<Text
              style={globalStyles.quoteSummary}
              numberOfLines={2}
            >
              {quote.summary || ''}
            </Text>*/}
          </TouchableOpacity> : null}
          {!new_reply ? <View 
            style={{
              marginTop: 5,
              flexDirection: 'row',
              justifyContent: 'flex-end'
            }}
          >
          <TouchableOpacity
              style={{
                padding: 10
              }}
              onPress={this.mindFollow}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: '#666'
                }}  
              >跟进</Text>
            </TouchableOpacity>
          </View> : null}
          {
              new_reply 
                ? <TouchableOpacity
                  style={{
                    padding: 10,
                    arginTop: 5,
                    backgroundColor: '#f3f4f5',
                    borderRadius: 3,
                    marginTop: 10,
                    marginBottom: 10
                  }}
                  onPress={new_reply.creator_id !== curUserId ? () => onReply() : () => onShowAction()}
                >
                  <Text style={{
                    fontSize: 14,
                    lineHeight: 24,
                    color: '#333'
                  }}>
                    {new_reply.content || ''}
                  </Text>
                </TouchableOpacity>
              : null
            }
        </TouchableOpacity>
      </Animated.View>
    )
  }
}

const MindModal = createFriendModal({
  TypeSelect,
  PannameEditor
})

class MindList extends React.Component {

  constructor(props) {
    super(props)
    this._dropdowns = []
    this.state = {
      refreshing: false,
      minds: [],
      loading: true,
      noDataTips,
      page: 1,
      dropdownShow: false
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
      minds = [], 
      noDataTips = noDataTips
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
        noDataTips
      })
    }
  }

  async loadData() {
    const { page, loading, refreshing } =  this.state
    let data = await get('features/mind',  {
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

  reload() {
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
    let { features, message } = this.props.homeData
    const { userId = '' } = this.props.loginData
    const { routeName } = this.props.navigation.state
    const title = features && features[routeName.toUpperCase()] || ''

    let { 
      minds, 
      refreshing, 
      loading, 
      noDataTips, 
      page,
      dropdownShow, 
    } = this.state

    message = [...message]
    let curMsg = message.find(msg => msg.feature === 'mind')
    let msgCount = curMsg && curMsg.total || 0
    
    return (
      <View 
        onStartShouldSetResponderCapture={(e) => {
          let target = e.nativeEvent.target
          if (this._dropdowns.indexOf(target) === -1) {
            this.setState({
              dropdownShow: false
            })
          }
        }}
        style={[globalStyles.container, {
          zIndex: 0
        }]}
      >
        <View style={globalStyles.header}>
          <Text style={globalStyles.logo}>{ title }</Text>
          <TouchableOpacity
            /* ref={ref => {
              ref && this._dropdowns.push(findNodeHandle(ref))
            }}
            onPress={() => this.setState({
              dropdownShow: !dropdownShow
            })} */
            onPress={() => this._modal.open('TypeSelect')}
            style={{
              padding: 10
            }}
          >
            <TYicon 
              ref={ref => {
                this._dropdowns = []
                ref && this._dropdowns.push(findNodeHandle(ref))
              }}
              style={{
                marginRight: 10
              }}
              name='tianjiaguanzhu' 
              size={18} 
              color='#666'></TYicon>
          </TouchableOpacity>
        </View>
        { 
          dropdownShow
            ? 
            <CardView
              ref={ref => {
                ref && this._dropdowns.push(findNodeHandle(ref))
              }}
              cardElevation={4}
              maxCardElevation={4}
              radius={5}
              backgroundColor={'#ffffff'}
              style={globalStyles.dropDown}
            >
              {Object.entries(MIND_TYPES).map(([id, guide], index) => (<TouchableOpacity 
                key={id}
                ref={ref => {
                  ref && this._dropdowns.push(findNodeHandle(ref))
                }}
                onPress={() => {
                  this.setState({ dropdownShow: false })
                }}
                style={{
                  padding: 10
                }}
              >
                <Text
                  ref={ref => {
                    ref && this._dropdowns.push(findNodeHandle(ref))
                  }}
                >{guide.action + guide.name + guide.icon}</Text>
              </TouchableOpacity>))}
            </CardView>
          : null
        }
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
            navigation={this.props.navigation}
            modal={this._modal}
            curReply={item}
            curUserId={userId}
            msgCount={msgCount}
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
            onReport={() => this._modal.open('Report')}
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
          onChangeType={(type_id) => {
            this.newMind(type_id)
            this._modal.close()
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
