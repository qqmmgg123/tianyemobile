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
import MindEditor from 'app/Mind/MindEditor'
import PannameEditor from 'app/PannameEditor'
import { Empty, Footer } from 'app/component/ListLoad'
import CardView from 'react-native-rn-cardview'
import { ANIMATION_DURATION, MIND_TYPES } from 'app/component/Const'

let noDataTips = '当前没有内容'

class MindItem extends React.Component {

  constructor(props) {
    super(props)
    this._animated = new Animated.Value(1)
    this.state = {
      loading: false,
      text: props.summary,
      content: '',
      summary: props.summary,
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

  render() {
    const rowStyles = [
      { opacity: this._animated }
    ]
    const { 
      type_id, 
      title = '', 
      curUserId, 
      creator_id,
      _id, 
      created_date, 
      updated_date, 
      last_reply_date, 
      new_reply, 
      quote, 
      column_id, 
      is_extract, 
      navigation 
    } = this.props
    const { text, content, expand } = this.state

    // 动态
    let activity = ''
    if (created_date) {
      activity = `${MIND_TYPES[type_id].action}于 ${getDate(new Date(created_date))}`
    }
    if (updated_date) {
      activity = `更新于 ${getDate(new Date(created_date))}`
    }
    if (last_reply_date && new_reply) {
      const { author, friend } = new_reply
      let username = (friend && friend.remark) || (author && (author.panname || author.username)) || ''
      activity = `${username} 回复于 ${getDate(new Date(created_date))}`
    }

    return (
      <Animated.View style={rowStyles}>
        <View style={{
          paddingTop: 15,
          paddingBottom: 10,
        }}>
          <View>
            <Text>{MIND_TYPES[type_id].icon + MIND_TYPES[type_id].name}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={title ? 0.6 : 1}
            onPress={
              title
              ? () => navigation.navigate('MindDetail', {
                itemId: _id
              })
              : null}
          >
            { title ?
              <Text style={{ 
              fontSize: 16,
              color: '#333',
              lineHeight: 24
            }}>{title}</Text> : null
            }
            <Text style={{
              fontSize: title ? 14 : 16,
              color: title ? '#4d4d4d' : '#333',
              lineHeight: 24,
              marginTop: 10
            }}>{text}</Text>
          </TouchableOpacity>
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
            >
              {quote.title || ''}
            </Text>
            <Text
              style={globalStyles.quoteSummary}
            >
              {quote.summary || ''}
            </Text>
          </TouchableOpacity> : null}
          <View style={{
            marginTop: 5,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
          <View
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingRight: 10
            }}
          >
            <Text style={{ 
              fontSize: 14,
              color: '#999999',
              flex: 1,
            }}>
              {activity}
            </Text>
          </View>
            {
              (curUserId && curUserId === creator_id)
              && (type_id === 'diary')
               ? (<TouchableOpacity
                    style={{
                      padding: 10
                    }}
                    onPress={() => {
                        this.props.modal.open('MindEditor', {
                          itemId: _id,
                        })
                      }
                    }
                  >
                    <Text style={{ 
                    fontSize: 14,
                    color: '#666',
                    }}>编辑</Text>
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
          </View>
          {new_reply && new_reply.conetnt ? <View style={{
            marginTop: 5,
            backgroundColor: '#f3f4f5',
            borderRadius: 3,
            marginBottom: 10,
            padding: 10
          }}>
            <Text 
              style={{ 
                fontSize: 14,
                lineHeight: 24,
                color: '#666',
              }}
            >
              {new_reply.conetnt}
            </Text>
          </View> : null}
        </View>
      </Animated.View>
    )
  }
}

const MindModal = createFriendModal({
  MindEditor: {
    com: MindEditor,
    animationType: 'slide'
  },
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

  layoutData(data) {
    let { 
      appName, 
      slogan, 
      features, 
      success, 
      pageInfo,
      minds = [], 
      noDataTips = noDataTips} = data
    if (success) {
      this.props.layoutHomeData({
        appName,
        slogan,
        features,

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

  componentWillReceiveProps(props) {
    if (props.loginData.userId !== this.props.loginData.userId) {
      this.refresh()
    }
  }

  render() {
    const { features } = this.props.homeData
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
            ref={ref => {
              ref && this._dropdowns.push(findNodeHandle(ref))
            }}
            onPress={() => this.setState({
              dropdownShow: !dropdownShow
            })}
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
                  this._modal.open('MindEditor', {
                    itemTypeId: id,
                    itemId: '',
                  })
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
        <View style={globalStyles.headerBottomLine}></View>
        {minds && minds.length ? <FlatList
          contentContainerStyle={{
            padding: 10
          }}
          data={minds}
          refreshing={refreshing}
          onRefresh={this.refresh}
          onEndReached={this.loadMore}
          onEndReachedThreshold={100}
          renderItem={({item, index}) => <MindItem
            navigation={this.props.navigation}
            modal={this._modal}
            {...item} 
            curUserId={userId}
            onRemove={this.removeItem.bind(this, index)} 
            onRefresh={() => this.refresh()}
            onReport={() => this._modal.open('Report')}
          />}
          ListFooterComponent={<Footer 
            data={minds} 
            onLoadMore={this.loadMore} 
            loading={loading}
            page={page}
            noDataTips={noDataTips}
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
          }}>{noDataTips}</Text>
          <Text style={{
            fontSize: 16,
            color: '#999',
            textAlign: 'center',
            lineHeight: 28
          }}>
            添加内心活动，方式如下
          </Text>
          <View
            style={{
              // flexDirection: 'row'
            }}
          >
          {Object.entries(MIND_TYPES).map(([id, guide]) => (
            <TouchableOpacity
              key={id}
              style={{
                marginTop: 20
              }}
              onPress={() => this._modal.open('MindEditor', {
                itemTypeId: id
              })}
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
          navigation={this.props.navigation}
          ref={ref => this._modal = ref}
          listRefresh={this.refresh}
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
