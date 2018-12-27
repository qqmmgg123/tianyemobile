import React from 'react'
import { View, FlatList, TouchableOpacity, Text, Animated, Modal, StyleSheet, TextInput } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from './HomeActions'
import { get, del, post } from './request'
import globalStyles from './globalStyles'
import TYicon from './TYicon'
import { getUserInfo, updateUser } from './request'
import { toast } from './Toast';

let noDataTips = '当前没有内容'

const ANIMATION_DURATION = 250

class ShareItem extends React.Component {

  constructor(props) {
    super(props)
    this._animated = new Animated.Value(1)
  }

  async removeHelp(id) {
    const res = await del(`share/${id}`)
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

  thank(id) {
    const { updateShares } = this.props
    updateShares(id)
  }

  render() {
    const rowStyles = [
      { opacity: this._animated }
    ]
    const { title = '', summary = '', curUserId, creator_id, _id, isThanked, author, column_id } = this.props

    return (
      <Animated.View style={rowStyles}>
        <View style={{
          paddingTop: 5,
          paddingBottom: 5,
        }}>
          <TouchableOpacity
            onPress={
              title
              ? () => this.props.navigation.navigate('ShareDetail', {
                itemId: _id
              })
              : null}
          >
          <Text style={{ 
            fontSize: 16,
            lineHeight: 32
          }}>{author && author.panname || ''}：</Text>
            { title ?
              <Text style={{ 
              fontSize: 16,
              color: '#7094b7',
              lineHeight: 32
            }}>{title}</Text> : null
            }
            <Text style={{ 
              fontSize: 14,
              color: '#4d4d4d',
              lineHeight: 24
            }}>{summary}</Text>
          </TouchableOpacity>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}>
          {isThanked
            ? (<Text style={{
                color: '#999', 
                fontSize: 12,
                height: 27,
                lineHeight: 27,
                paddingRight: 14
              }}>已赞叹</Text>)
            : (<TouchableOpacity
                  onPress={() => this.thank(_id)}
                >
                  <Text style={{ 
                    fontSize: 12,
                    color: '#7094b7',
                    height: 27,
                    lineHeight: 27,
                    paddingRight: 14
                  }}>赞叹</Text>
                </TouchableOpacity>)}
            {
              curUserId && curUserId === creator_id
               ? (<TouchableOpacity
                    onPress={() => {
                      console.log(_id)
                      this.props.navigation.navigate('ShareEditor', {
                        itemId: _id,
                        itemColumn: column_id,
                        onGoBack: () => this.props.onRefresh()
                      })}
                    }
                  >
                    <Text style={{ 
                    fontSize: 12,
                    color: '#7094b7',
                    height: 27,
                    lineHeight: 27,
                    paddingRight: 14
                    }}>编辑</Text>
                  </TouchableOpacity>)
              : null
            }
            {
              curUserId && curUserId === creator_id
               ? (<TouchableOpacity
                    onPress={() => this.removeHelp(_id)}
                  >
                    <Text style={{ 
                    fontSize: 12,
                    color: '#7094b7',
                    height: 27,
                    lineHeight: 27,
                    paddingRight: 14
                    }}>删除</Text>
                  </TouchableOpacity>)
              : null
            }
            <TouchableOpacity
              onPress={() => this.props.onReport()}
            >
              <Text style={{ 
                fontSize: 12,
                color: '#7094b7',
                height: 27,
                lineHeight: 27,
                paddingRight: 14
              }}>举报</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    )
  }
}

class Share extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      refreshing: false,
      shares: [],
      noDataTips,
      modalVisible: false,
      panname: ''
    }
  }

  refresh() {
    this.loadData()
  }

  setModalVisible(modalType, visible) {
    this.setState({
      modalType,
      modalVisible: visible
    })
  }

  async createPanname() {
    let { panname } = this.state
    panname = panname.trim()
    if (!panname) {
      toast('笔名不能填空。')
      return
    }

    const res = await post('panname', {
      panname
    })
    if (res.success) {
      let userInfo = getUserInfo()
      userInfo.panname = panname
      updateUser(userInfo)
      this.setModalVisible('panname', false)
      this.props.navigation.navigate('ShareEditor')
    }
  }

  async updateShares(id) {
    let { shares } = this.state
    let share = shares.find(item => item._id === id)
    if (!share.isThanked && !share.thanking) {
      share.thanking = true
      this.setState({
        shares: shares
      })
      const res = await post(`thank/${share._id}`)
      share.thanking = false
      if (res.success) {
        share.isThanked = true
        this.setState({
          shares: shares
        })
      }
    }
  }

  async loadData() {
    let data = await get('features/share')
    let { appName, slogan, features, success, shares = [], noDataTips = noDataTips} = data
    if (success) {
      this.props.layoutHomeData({
        appName,
        slogan,
        features
      })
      console.log('refresh finish...', data)
      this.setState({
        refreshing: false,
        shares,
        modalType: 'panname',
        noDataTips
      })
    }
  }

  componentWillMount() {
    this.loadData()
  }

  render() {
    let { shares, modalType } = this.state
    const { userId = '' } = this.props.loginData
    
    return (
      <View style={{flex: 1, paddingTop: 20}}>
        {this.state.shares.length ? <FlatList
          style={{
            paddingTop: 3,
            paddingLeft: 7,
            paddingRight: 7,
            paddingBottom: 4
          }}
          data={this.state.shares}
          refreshing={this.state.refreshing}
          onRefresh={this.refresh.bind(this)}
          renderItem={({item, index}) => <ShareItem
            navigation={this.props.navigation}
            {...item} 
            curUserId={userId}
            onRemove={() => {
              shares.splice(index, 1)
              this.setState({
                shares
              })
            }} 
            onRefresh={() => this.refresh()}
            updateShares={this.updateShares.bind(this)}
            onReport={() => this.setModalVisible('report', true)}
          />}
          ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
          keyExtractor={item => (item._id)}
        /> : (<View>
          <Text style={{
            color: '#333333',
            textAlign: 'center'
          }}>
            {this.state.noDataTips}
          </Text>
        </View>)}
        <TouchableOpacity 
          onPress={() => {
            let userInfo = getUserInfo()
            if (userInfo && userInfo.panname) {
              this.props.navigation.navigate('ShareEditor', {
                onGoBack: () => this.refresh()
              })
            } else {
              this.setModalVisible('panname', true)
            }
          }}
          style={{
            position: 'absolute',
            width: 48,
            height: 48,
            backgroundColor: 'red',
            bottom: 20,
            right: 20,
            borderRadius: 24,
            elevation:4,
            shadowOffset: { width: 5, height: 5 },
            shadowColor: "grey",
            shadowOpacity: 0.5,
            shadowRadius: 10,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <TYicon name='xiezi' size={32} color='white'></TYicon>
          {/*<Text
            style={{
            color: '#ffffff',
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: 48,
          }}></Text>*/}
        </TouchableOpacity>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
        >
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}>
            <View style={{
              width: 250,
              backgroundColor: 'white',
              borderRadius: 3,
              padding: 10
            }}>
            { modalType === 'panname'
              ? (<Text>抱歉，需要您给自己取一个对外的笔名，以保护您的隐私</Text>) 
              : null }
              <TextInput
                autoFocus={true}
                style={{
                  borderColor: '#cccccc', 
                  borderWidth: 1,
                  paddingTop: 3,
                  paddingHorizontal: 7,
                  paddingBottom: 4,
                  borderRadius: 3,
                  marginTop: 10,
                  minHeight: modalType === 'panname' ? 36 : 50
                }}
                placeholder={modalType === 'panname' ? '您的笔名' : '请填写你举报的理由'}
                placeholderTextColor="#cccccc"
                autoCapitalize="none"
                multiline={modalType === 'report'}
                onChangeText={(panname) => this.setState({panname})}
                value={this.state.panname}
              />
              <View style={{
                flexDirection: 'row'
              }}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={modalType === 'panname'
                    ? () => this.createPanname()
                    : () => {
                    this.setModalVisible('report', !this.state.modalVisible);
                  }}>
                  <Text style={styles.buttonText}>提交</Text>
                </TouchableOpacity>
                <View style={{ width: 10 }} />
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    this.setModalVisible('report', !this.state.modalVisible);
                  }}>
                  <Text style={styles.buttonText}>取消</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderColor: '#dddddd', 
    borderWidth: 1, 
    borderRadius: 3,
    justifyContent: 'center',
    height: 36,
    paddingTop: 3,
    paddingHorizontal: 7,
    paddingBottom: 4,
    marginTop: 10
  },
  buttonText: {
    alignItems: 'center', 
    color: '#666666', 
    textAlign: 'center'
  },
})

const mapStateToProps = (state) => {
  const { loginData } = state
  return { loginData }
}

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    layoutHomeData,
  }, dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(Share);
