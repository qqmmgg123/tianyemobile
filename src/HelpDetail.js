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
import { Footer } from 'app/component/ListLoad'
import globalStyles from 'app/component/globalStyles'
import { STATUS_BAR_HEIGHT } from 'app/component/Const'
import ActionModal from 'app/Karma/ActionModal'
import { Spinner } from 'app/component/GlobalModal'

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
      onReply,
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
      // TODO 删除后效果
      // this.onRemove()
      this.props.navigation.goBack()
      this.props.navigation.state.params.onBackRemove();
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
            onPress={() => this.props.onReply()}
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
                  onPress={() => this.removeMind(help._id)}
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
    this._defaultReplyData = null
    this.state = {
      help: null,
      loading: true,
      noDataTips,
      refreshing: false,
      replyData: null,
      reply: ''
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
      , reqParams = { 
        content,
        parent_id: parentId,
        parent_type: 'mind',
        receiver_id: receiverId
      }
      , newReply = Object.assign({}, reqParams)
      if (help) {
        let replies = help.replies || []
        , user = getUserInfo()
        , key = replies.length
        newReply._id = 'newreply' + key
        newReply.username = user.username
        newReply.reply_id = replyId
        newReply.reply_type = replyType
        newReply.creator_id = user._id
        if (replyType === 'reply') {
          let replyTo = help.replies.find(item => item._id === replyId)
          newReply.receivername = replyTo.remark[0] || replyTo.username[0] || ''
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
    this.loadData()
  }

  async loadData() {
    const mindId = this.props.navigation.getParam('itemId')
    let data = await get(`help/${mindId}`)
    if (data) {
      let { success, help } = data
      if (success) {
        this._defaultReplyData = { 
          replyType: 'mind', 
          replyId: help._id,
          parentId: help._id,
          receiverId: help.creator_id 
        }
        this.setState({
          help,
          loading: false
        })
      }
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
    let { noDataTips, help, reply, refreshing, loading } = this.state
    const { receiverName = '' } = this.state.replyData || {}
    const { userId = '' } = this.props.loginData
    const { navigation } = this.props
    if (help) {
      let { replies } = help
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
          <Back navigation={navigation} />
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
                  curUserId={userId} 
                  navigation={navigation}
                  help={help} 
                  onReply={() => this.onReply()} 
                />
              }
              renderItem={({item, index}) => <ReplyItem 
                navigation={navigation}
                onReply={(data) => {
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
                value={reply}
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
