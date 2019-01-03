import React from 'react'
import { View, FlatList, TouchableOpacity, Text, TextInput, SafeAreaView, Modal, KeyboardAvoidingView, Animated, findNodeHandle, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from './HomeActions';
import { get, post, del, getUserInfo } from './request'
import globalStyles from './globalStyles'
import TYicon from './TYicon'
import HelpEditor from './HelpEditor'
import Back from './component/Back'

let noDataTips = '当前没有内容'

const ANIMATION_DURATION = 250

class HelpItem extends React.Component {

  constructor(props) {
    super(props)
    this._animated = new Animated.Value(1)
  }

  async removeHelp(id) {
    const res = await del(`trouble/${id}`)
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

  moreButton(id, reply_count) {
    if (reply_count > 5) {
      return (
        <TouchableOpacity 
          onPress={() => this.props.navigation.navigate('HelpDetail', {
            itemId: id
          })}
          style={{
            padding: 10
          }}
        >
          <Text style={{ 
          fontSize: 14,
          color: '#FF0140',
          height: 27,
          lineHeight: 27,
          paddingRight: 14,
          textAlign: 'center'
        }}>更多 {reply_count - 5} 条回复</Text>
        </TouchableOpacity>
      )
    } else {
      return null
    } 
  }

  render() {
    const rowStyles = [
      { opacity: this._animated }
    ]
    const { content = '', replies, _id, creator_id, reply_count, remark = [], username = '' } = this.props
    console.log(remark)
    return (
      <Animated.View style={rowStyles}>
        <View 
          style={{
            paddingTop: 10,
            // paddingBottom: 15
          }}
        >
          <View>
            <Text style={{ 
              fontSize: 14,
              color: '#333',
              lineHeight: 24
              }}>{remark[0] || username}：</Text>
            <Text style={{ 
              marginTop: 5,
              fontSize: 14,
              color: '#333',
              lineHeight: 24
              }}>{content}</Text>
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
              onPress={() => this.props.onReply({ 
                replyType: 'help', 
                replyId: _id,
                parentId: _id,
                receiverId: creator_id 
              })}
            >
              <Text style={{ 
              fontSize: 14,
              color: '#FF0140',
              }}>回复</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: 10
              }}
              onPress={() => this.removeHelp(_id)}
            >
              <Text style={{ 
              fontSize: 14,
              color: '#FF0140'
              }}>已排解</Text>
            </TouchableOpacity>
          </View>
          <View style={{
            marginTop: 5,
            backgroundColor: '#f3f4f5',
            borderRadius: 3,
            marginBottom: 10
          }}>
            {replies.map(reply => {
              const replyName = (reply.remark && reply.remark[0] || reply.username || '')
              return (
                <TouchableOpacity
                  key={reply._id}
                  style={{
                    padding: 10
                  }}
                  onLongPress={() => this.removeReply()}
                  onPress={() => this.props.onReply({ 
                    replyType: 'reply', 
                    replyId: reply._id,
                    parentId: _id,
                    receiverId: reply.creator_id,
                    receiverName: replyName
                  })}
                >
                  <Text style={{
                    fontSize: 14,
                    color: '#333'
                  }}>
                    {replyName + (reply.reply_type === 'reply' ? '@' + (reply.rremark && reply.rremark[0] || reply.receivername) : '') + '：' + (reply.content || '')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => this.props.navigation.navigate('ClassicDetail', {
                      itemId: reply.ref_id
                    })}
                  >
                    <Text>{reply.ref_title || ''}</Text>
                    <Text>{reply.ref_summary || ''}</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )
            })}
            {this.moreButton(_id, reply_count)}
          </View>
        </View>
      </Animated.View>
    )
  }
}

class Help extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      helps: [],
      noDataTips,
      troubleHolder: '',
      modalVisible: false,
      reply: '',
      replyVisible: false,
      replyData: null
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
      let { helps } = this.state
      if (success) {
        let user = getUserInfo()
        let help = helps.find(item => item._id === parentId)
        help.reply_count += 1
        let { reply } = res
        reply.username = user.username
        if (replyType === 'reply') {
          let replyTo = help.replies.find(item => item._id === replyId)
          reply.receivername = replyTo.remark[0] || replyTo.username[0] || ''
        }
        if (help) {
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

  refresh() {
    this.loadData()
  }

  async loadData() {
    let data = await get('features/help')
    let { appName, slogan, features, success, helps = [], noDataTips = noDataTips, troubleHolder = '' } = data
    if (success) {
      this.props.layoutHomeData({
        appName,
        slogan,
        features
      })
      this.setState({
        helps,
        noDataTips,
        troubleHolder,
      })
    }
  }

  componentWillMount() {
    this.loadData()
  }

  componentDidUpdate(props, state) {
    let { replyVisible } = state
    if (this.state.replyVisible && replyVisible !== this.state.replyVisible) {
      this._replyInput.focus()
    }
  }

  render() {
    const { features } = this.props.homeData
    const { routeName } = this.props.navigation.state
    const title = features && features[routeName.toUpperCase()] || ''
    const { receiverName = '' } = this.state.replyData || {}
    return (
      <View
        style={styles.container}
        onStartShouldSetResponderCapture={(e) => {
          let target = e.nativeEvent.target
          if (target !== findNodeHandle(this._replyInput)
            && (target !== findNodeHandle(this._replyButton))
            && (target !== findNodeHandle(this._replyButtonText))) {
              this._replyInput && this._replyInput.blur();
          }
        }}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>{ title }</Text>
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              paddingHorizontal: 10,
              height: 42,
            }}
            onPress={() => this.props.navigation.navigate('Friend')}
          >
            <Text style={{
              alignItems: 'center', 
              color: '#666666', 
              textAlign: 'center',
              color: 'rgb(112, 148, 183)'
            }}>知己</Text>
          </TouchableOpacity>
        </View>
        <View style={globalStyles.headerBottomLine}></View>
        <TouchableOpacity
          onPress={() => this.setModalVisible(true)}
          style={{
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <TYicon name='bi' size={18} color='#666'></TYicon>
          <Text style={{
            fontSize: 14,
            color: '#999999',
            height: 24,
            lineHeight: 24,
            marginLeft: 10
          }}>{this.state.troubleHolder}</Text>
        </TouchableOpacity>
        <View style={globalStyles.splitLine}></View>
        {this.state.helps.length ? <FlatList
          style={{
            paddingHorizontal: 15,
            paddingBottom: 15
          }}
          data={this.state.helps}
          renderItem={({item, index}) => <HelpItem 
            navigation={this.props.navigation}
            onReply={this.onReply.bind(this)} 
            {...item} 
            onRemove={() => {
              let { helps } = this.state
              helps.splice(index, 1)
              this.setState({
                helps
              })
            }} 
          />}
          ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
          keyExtractor={(item) => (item._id)}
        /> : (<View>
          <Text style={{
            color: '#333333',
            textAlign: 'center',
            paddingTop: 20
          }}>
            {this.state.noDataTips}
          </Text>
        </View>)}
        <Modal
          animationType='slide'
          // transparent={true}
          visible={this.state.modalVisible}
          onBackButtonPress={() => this.setModalVisible(false)}
        >
          <SafeAreaView
            style={{flex: 1, backgroundColor: 'transparent'}} 
            forceInset={{ top: 'always', horizontal: 'never' }}
          >
            <View 
              style={{
                flex: 1
              }}
            >
              <Back goBack={() => this.setModalVisible(false)} />
              <HelpEditor 
                listRefresh={() => {
                  this.setModalVisible(false)
                  this.refresh()
                }} 
                placeholder={this.state.troubleHolder} 
              />
            </View>
          </SafeAreaView>
        </Modal>
        {this.state.replyVisible ? (<KeyboardAvoidingView
          keyboardVerticalOffset={20}
          contentContainerStyle={{
            flexDirection: 'row',
            padding: 10,
            backgroundColor: 'white',
            alignItems: 'center'
          }}
          style={{
            position: 'absolute', 
            left: 0, 
            right: 0, 
            bottom: 0
          }} 
          behavior="position"
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
          {this.state.reply.trim() ? (<TouchableOpacity 
            ref={ref => this._replyButton = ref}
            style={globalStyles.button}
            onPress={this.replyConfirm.bind(this)}
           >
            <Text 
              ref={ref => this._replyButtonText = ref}
              style={globalStyles.buttonText}>送出</Text>
          </TouchableOpacity>) : null}
        </KeyboardAvoidingView>) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 42,
    paddingLeft: 10
  },
  logo: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FF0140'
  },
  slogan: {
    textAlign: 'center',
    color: 'orange'
  },
})

const mapStateToProps = (state) => {
  const { homeData } = state
  return { homeData }
}

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    layoutHomeData,
  }, dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(Help);
