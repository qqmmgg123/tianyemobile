import React from 'react'
import { View, FlatList, ScrollView, RefreshControl, TouchableOpacity, Text, Animated } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from 'app/HomeActions'
import { get, del } from 'app/component/request'
import globalStyles from 'app/component/globalStyles'
import { Empty, Footer } from 'app/component/ListLoad'
import TYicon from 'app/component/TYicon'
import { getDate } from 'app/utils'

const ANIMATION_DURATION = 250

class DiaryItem extends React.Component {

  constructor(props) {
    super(props)
    this._animated = new Animated.Value(1);
  }

  async removeDiary(id) {
    const res = await del(`diary/${id}`)
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
    const thanks = {
      thank: '认同',
      understand: '理解'
    }
    const { 
      _id, 
      userId,
      panname, 
      type_id, 
      giver_id, 
      given_date, 
      mUnderstandTotal, 
      mThankTotal, 
      oUnderstandTotal, 
      oThankTotal, 
      onAddFriend 
    } = this.props

    return (
      <Animated.View style={rowStyles}>
        <View style={{
          padding: 10,
          backgroundColor: 'white',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <View
            style={{
              flex: 1
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginRight: 10
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: '#333',
                }}
              >
                {
                  userId === giver_id 
                    ? '您' + thanks[type_id] + '了' + panname 
                    : panname + thanks[type_id] + '了你'
                }
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: '#999'
                }}
              >
                {getDate(new Date(given_date))}
              </Text>
            </View>
            <Text 
              style={{
                marginTop: 10,
                fontSize: 14,
                color: '#999',
                lineHeight: 24
              }}
            >
              {[
                mThankTotal || mUnderstandTotal ? '他一共' : '',
                ...[mUnderstandTotal ? `理解您${mUnderstandTotal}次` : '', 
                mThankTotal ? `认同您${mThankTotal}次` : ''].filter(text => !!text).join(','), 
                oThankTotal || oUnderstandTotal ? '您一共' : '',
                ...[oUnderstandTotal ? `理解他${oUnderstandTotal}次` : '', 
                oThankTotal ? `认同他${oThankTotal}次` : ''].filter(text => !!text).join(',')
              ].join('')}
            </Text>
          </View>
          <View
            style={{
              alignSelf: 'flex-start'
            }}
          >
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => onAddFriend()}
            >
              <Text style={globalStyles.buttonText}>加为有缘人</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    )
  }
}

class FateList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      diarys: [],
      loading: true,
      page: 1
    }
    props.navigation.setParams({
      component: this
    })
  }

  static navigationOptions = {
    title: '投缘'
  }

  layoutData(data) {
    let { 
      success, 
      pageInfo,
      diarys = [],
    } = data
    if (success) {
      this.setState({
        page: pageInfo.nextPage || 0,
        diarys: [...this.state.diarys, ...diarys],
      })
    }
  }

  async loadData() {
    const { page, loading, refreshing } =  this.state
    let data = await get('features/diary', {
      perPage: 20,
      page,
      isVisit: refreshing
    })
    if (loading) {
      this.setState({
        loading: false,
        refreshing: false
      }, () => {
        data && this.layoutData(data)
      })
    }
    if (refreshing) {
      this.setState({
        refreshing: false,
        diarys: []
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
      loading: true,
      diarys: []
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
    let { diarys } = this.state
    diarys.splice(index, 1)
    this.setState({
      diarys
    })
  }

  // 处理消息显示状态
  newFatesReaded(message, karmaMsg, curMsg) {
    this.refresh()
    console.log(message, karmaMsg, curMsg)
    if (message && karmaMsg && curMsg) {
      // 处理当前投缘消息小红点
      curMsg.total = 0
      curMsg.has_new = false

      // 处理缘tab消息小红点
      let talkMsg = karmaMsg.sub_feature.find(msg => msg.feature === 'talk')
      console.log(talkMsg)
      if (!talkMsg || (talkMsg.reply_total === 0 && talkMsg.mind_total === 0)) {
        karmaMsg.has_new = false
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
    let curMsg = karmaMsgs.find(msg => msg.feature === 'fate')
    if (!curMsg || !curMsg.total) {
      console.log('Fate load data......', curMsg)
      this.loadData()
    }
  }

  componentDidMount() {
    this._foucsHandle = this.props.navigation.addListener('didFocus', () => {
      let query = msg => msg.feature === 'karma'
      let message = [...this.props.homeData.message]
      let karmaMsg = message.find(query)
      let karmaMsgs = karmaMsg && karmaMsg.sub_feature || []
      let curMsg = karmaMsgs.find(msg => msg.feature === 'fate')
      if (curMsg && curMsg.total) {
        this.newFatesReaded(message, karmaMsg, curMsg)
      }
    })
  }

  componentWillUnmount() {
    this._foucsHandle.remove()
  }

  componentWillReceiveProps(nextProps) {
    let query = msg => msg.feature === 'karma'
    let newMessage = [...nextProps.homeData.message]
    let newKarmaMsg = newMessage.find(query)
    let newKarmaMsgs = newKarmaMsg && newKarmaMsg.sub_feature || []
    let newMsg = newKarmaMsgs.find(msg => msg.feature === 'fate')

    if (newMsg && newMsg.total) {
      if (nextProps.navigation.isFocused()) {
        this.newFatesReaded(newMessage, newKarmaMsg, newMsg)
      }
      return
    }

    if (nextProps.loginData.userId !== this.props.loginData.userId) {
      this.reload()
    }
  }

  render() {
    let { 
      diarys, 
      refreshing, 
      loading, 
      page,
    } = this.state
    let { loginData } = this.props
    , { userId } = loginData

    return (
      <View style={globalStyles.container}>
        {diarys && diarys.length ? <FlatList
          data={diarys}
          refreshing={refreshing}
          onRefresh={this.refresh}
          onEndReached={this.loadMore}
          onEndReachedThreshold={100}
          renderItem={({item, index}) => <DiaryItem 
            {...item} 
            userId={userId}
            navigation={this.props.navigation}
            onRemove={this.removeItem.bind(this, index)} 
            onAddFriend={() => {
              this.props.navigation.navigate('AcceptPrompt', {
                friendId: item._id,
                status: 'add',
                onAdd: () => {
                  this.reload()
                  this.props.screenProps.onFateChange()
                }
              })
            }}
          />}
          ListFooterComponent={<Footer 
            data={diarys} 
            onLoadMore={this.loadMore} 
            loading={loading}
            page={page}
          />}
          ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
          keyExtractor={(item) => (item._id)}
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
          }}></Text>
          <Text style={{
            fontSize: 16,
            color: '#999',
            textAlign: 'center',
            lineHeight: 28
          }}>
            抱歉，暂未发现新的与您投缘的人
          </Text>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('Earth', {
              onGoBack: () => this.refresh()
            })}
            style={{
              borderRadius: 3,
              justifyContent: 'center',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Text style={{
              marginTop: 10,
              fontSize: 16,
              lineHeight: 28,
              color: '#EE3D80',
              textAlign: 'center',
              marginRight: 10
            }}>到“尘”，发现有缘人。</Text>
            <TYicon
              name='jiantou'
              size={16} 
              color={'#EE3D80'}
              style={{
                marginTop: 10
              }}
            ></TYicon>
          </TouchableOpacity>
        </ScrollView>) : <Empty loading={true} />)}
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

export default connect(mapStateToProps, mapDispatchToProps)(FateList)
