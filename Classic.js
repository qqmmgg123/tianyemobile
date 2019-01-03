import React from 'react'
import { SafeAreaView, View, FlatList, TouchableOpacity, Text, TextInput, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from './HomeActions';
import { get, post } from './request'
import globalStyles from './globalStyles'
import { createFriendModal } from './GlobalModal'
import Back from './component/Back'
import { toast } from './Toast'

let noDataTips = '当前没有内容'

class Recommend extends React.Component {
  render() {
    return (
      <TouchableOpacity 
        activeOpacity={1} 
        onPressOut={() => this.props.modal.close()}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}
      >
        <View style={{
          width: 250,
          height: 150,
          backgroundColor: 'white',
          borderRadius: 3,
          padding: 10
        }}>
          <View style={{
            paddingVertical: 10
          }}>
            <Text style={{
              color: '#999',
            }}>推荐到:</Text>
          </View>
          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => {
              this.props.modal.close()
              this.props.navigation.navigate('HelpSelect', {
                onGoBack: (help) => this.props.refReply(help)
              })
            }}>
            <Text style={globalStyles.buttonText}>解忧</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }
}

class ReplyRefEditor extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      content: '',
      help: props.modal.getParam('help'),
      classic: props.modal.getParam('classic')
    }
  }

  async replyConfirm() {
    let { content, help, classic } = this.state
    let replyId = help._id
    let ref_id = classic._id
    let res = await post(`help/${replyId}/reply`, { 
      content,
      parent_id: replyId,
      parent_type: 'help',
      ref_id
    })
    if (res) {
      let { success } = res
      if (success) {
        this.modal.close()
        toast('已送出。')
      }
    }
  }

  render() {
    let { help, classic } = this.state
    return (
      <SafeAreaView 
        style={{flex: 1, backgroundColor: '#fff'}} 
        forceInset={{ top: 'always', horizontal: 'never' }}
      > 
        <Back goBack={() => this.props.modal.close()} />
        <Text
          style={{
            padding: 10,
            fontSize: 14,
            color: '#333'
          }}
        >
          {help.content}
        </Text>
        <View style={{
          flexDirection: 'row', 
          alignItems: 'center',
          marginTop: 10,
          padding: 10
        }}>
          <TextInput
            style={{
              borderColor: '#cccccc', 
              borderWidth: 1,
              height: 36,
              paddingTop: 3,
              paddingHorizontal: 7,
              paddingBottom: 4,
              borderRadius: 3,
              textAlignVertical: 'center',
              flex: 1
            }}
            placeholder="推荐说明..."
            placeholderTextColor="#cccccc"
            allowFontScaling={false}
            autoCapitalize="none"
            onChangeText={(content) => this.setState({content})}
            value={this.state.content}
            multiline={true}
            autoFocus={true}
          />
          <TouchableOpacity
            style={{
              borderColor: '#dddddd', 
              borderWidth: 1, 
              borderRadius: 3,
              justifyContent: 'center',
              height: 36,
              paddingTop: 3,
              paddingHorizontal: 7,
              paddingBottom: 4,
              marginLeft: 10
            }}
            onPress={() => this.replyConfirm()}
          >
            <Text style={{alignItems: 'center', color: '#666666'}}>送出</Text>
          </TouchableOpacity>
        </View>
        <Text
          style={{
            padding: 10,
            fontSize: 14,
            color: '#333'
          }}
        >
          {classic.title}
        </Text>
        <Text
          style={{
            padding: 10,
            fontSize: 14,
            color: '#333'
          }}
        >
          {classic.summary}
        </Text>
      </SafeAreaView>
    )
  }
}

const RecommendModal = createFriendModal({ 
  Recommend, 
  ReplyRefEditor: {
    com: ReplyRefEditor,
    animationType: 'slide'
  } 
})

class Classic extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      classics: [],
      loading: true,
      noDataTips,
      modalVisible: false
    }
  }

  refresh() {
    this.setState({
      refreshing: true
    })
    this.loaderData()
  }

  async loaderData() {
    let data = await get('features/classic')
    if (this.state.loading) {
      this.setState({
        loading: false,
        refreshing: false,
      })
    }
    let { 
      appName, 
      slogan, 
      features, 
      success, 
      classics = [], 
      noDataTips = noDataTips } = data
    if (success) {
      this.props.layoutHomeData({
        appName,
        slogan,
        features
      })
      this.setState({
        classics,
        noDataTips
      })
    }
  }

  setModalVisible(visible) {
    this.setState({
      modalVisible: visible
    })
  }

  componentWillMount() {
    this.loaderData()
  }

  render() {
    const { features } = this.props.homeData
    const { routeName } = this.props.navigation.state
    const title = features && features[routeName.toUpperCase()] || ''

    return (
      <View style={styles.container}>
        <View style={ styles.header }>
          <Text style={styles.logo}>{ title }</Text>
        </View>
        <View style={globalStyles.headerBottomLine}></View>
        {this.state.classics.length ? <FlatList
          style={{
            paddingTop: 3,
            paddingLeft: 7,
            paddingRight: 7,
            paddingBottom: 4
          }}
          data={this.state.classics}
          refreshing={this.state.refreshing}
          onRefresh={this.refresh.bind(this)}
          renderItem={({item}) => {
            return (
              <View style={{
                paddingTop: 15,
                paddingBottom: 10,
              }}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate('ClassicDetail', {
                    itemId: item._id
                  })}
                >
                  <Text style={{ 
                    fontSize: 16,
                    color: '#333',
                    lineHeight: 24
                   }}>{item.title}</Text>
                  <Text style={{ 
                    fontSize: 14,
                    color: '#4d4d4d',
                    lineHeight: 24,
                    marginTop: 10
                   }}>{item.summary}</Text>
                </TouchableOpacity>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}>
                  <TouchableOpacity
                    style={{
                      padding: 10
                    }}
                    onPress={() => this._modal.open('Recommend', {
                      classic: item
                    })}
                  >
                    <Text style={{ 
                      fontSize: 14,
                      color: '#666'
                    }}>推荐</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          }}
          ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
          keyExtractor={(item) => (item._id)}
        /> :  (<View>
          <Text style={globalStyles.noDataText}>
            {!this.state.loading ? this.state.noDataTips : '加载中...'}
          </Text>
        </View>)}
        <RecommendModal 
          navigation={this.props.navigation}
          ref={ ref => this._modal = ref }
          refReply={(help) => {
            this._modal.open('ReplyRefEditor', {
              help
            })
          }}
        />
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

export default connect(mapStateToProps, mapDispatchToProps)(Classic);
