/**
 * 有缘人模块入口
 */

import React from 'react'
import { 
  View, 
  FlatList
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from 'app/HomeActions'
import { get } from 'app/component/request'
import globalStyles from 'app/component/globalStyles'
import FriendItem from 'app/Friend/FriendItem'
import FriendEmptyGuide from 'app/Friend/FriendEmptyGuide'
import { Empty, PageError } from 'app/component/ListLoad'

class FriendList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      friends: [],
      loading: true,
      error: false,
    }
    props.navigation.setParams({
      component: this
    })
  }

  static navigationOptions = {
    title: '有缘人'
  }

  refresh = () => {
    this.setState({
      refreshing: true
    }, () => {
      this.loadData()
    })
  }

  reload = () => {
    this.setState({
      loading: true,
      friends: []
    }, () => {
      this.loadData()
    })
  }

  layoutData(data) {
    let { success, friends } = data
    if (success) {
      this.setState({
        friends
      })
    }
  }

  async loadData() {
    const { loading, refreshing } =  this.state
    try {
      let data = await get('karma/friend', {
        isVisit: refreshing
      })
      if (loading) {
        this.setState({
          error: false,
          loading: false,
          refreshing: false,
        }, () => {
          data && this.layoutData(data)
        })
      }
      if (refreshing) {
        this.setState({
          error: false,
          refreshing: false,
          minds: []
        }, () => {
          data && this.layoutData(data)
        })
      }
    } catch (err) {
      this.setState({
        error: true,
        loading: false,
        refreshing: false
      })
    }
  }

  // 处理消息显示状态
  friendNewReaded(message, karmaMsg, curMsg) {
    this.refresh()
    if (message && karmaMsg && curMsg) {
      // 处理当前投缘消息小红点
      curMsg.total = 0
      curMsg.has_new = false

      // 处理缘tab消息小红点
      let talkMsg = karmaMsg.sub_feature.find(msg => msg.feature === 'talk')
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
    let curMsg = karmaMsgs.find(msg => msg.feature === 'friend')
    if (!curMsg || !curMsg.total) {
      this.loadData()
    }
  }

  componentDidMount() {
    this._foucsHandle = this.props.navigation.addListener('didFocus', () => {
      let query = msg => msg.feature === 'karma'
      let message = [...this.props.homeData.message]
      let karmaMsg = message.find(query)
      let karmaMsgs = karmaMsg && karmaMsg.sub_feature || []
      let curMsg = karmaMsgs.find(msg => msg.feature === 'friend')
      if (curMsg && curMsg.total) {
        this.friendNewReaded(message, karmaMsg, curMsg)
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
    let newKarmaMsgs = newKarmaMsg && newKarmaMsg.sub_feature || []
    let newMsg = newKarmaMsgs.find(msg => msg.feature === 'friend')

    if (newMsg && newMsg.total) {
      if (nextProps.navigation.isFocused()) {
        this.friendNewReaded(newMessage, newKarmaMsg, newMsg)
      }
      return
    }

    if (nextProps.loginData.userId && (nextProps.loginData.userId !== this.props.loginData.userId)) {
      this.reload()
    }
  }

  render() {
    let { 
      friends, 
      loading, 
      refreshing,
      error
    } = this.state

    let {
      navigation, 
      screenProps
    } = this.props

    return (
      <View 
        style={[globalStyles.container, {
          zIndex: 0
        }]}
      >
        {this.state.friends.length ? <FlatList
          data={friends}
          refreshing={refreshing}
          onRefresh={this.refresh}
          renderItem={({item, index}) => <FriendItem 
            {...item} 
            onRemove={() => {
              friends.splice(index, 1)
              this.setState({
                friends
              }, () => {
                screenProps.onFriendChange()
              })
            }} 
            onAccpect={(friendId) => {
              navigation.navigate('AcceptPrompt', {
                friendId,
                status: 'accept',
                onListRefresh: () => {
                  this.reload()
                  screenProps.onFriendChange()
                }
              })
            }}
            onDeny={(friendId, animateFun) => {
              navigation.navigate('AcceptPrompt', {
                friendId,
                status: 'deny',
                onDenyConfirm: () => {
                  animateFun()
                }
              })
            }}
            onRemark={(friendship) => {
              navigation.navigate('AcceptPrompt', {
                friendship,
                status: 'remark',
                onListRefresh: () => {
                  this.reload()
                  screenProps.onFriendChange()
                }
              })
            }}
          />}
          ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
          keyExtractor={(item) => (item._id)}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        /> : (!loading ? (!error ? <FriendEmptyGuide
            navigation={navigation}
            refreshing={refreshing}
            onRefresh={this.refresh}
            onReload={this.reload}
          /> : <PageError
              refreshing={refreshing}
              onRefresh={this.refresh}
            />): <Empty loading={true} />)}
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

export default connect(mapStateToProps, mapDispatchToProps)(FriendList)
