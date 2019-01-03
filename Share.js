import React from 'react'
import { View, FlatList, TouchableOpacity, Text, Animated, Modal, StyleSheet, TextInput } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from './HomeActions'
import { get, del, post } from './request'
import globalStyles from './globalStyles'
import TYicon from './TYicon'
import { getUserInfo } from './request'
import { createFriendModal } from './GlobalModal'
import Report from './Report'
import PannameEditor from './PannameEditor'

let noDataTips = '当前没有内容'

const ANIMATION_DURATION = 250

class ShareItem extends React.Component {

  constructor(props) {
    super(props)
    this._animated = new Animated.Value(1)
  }

  async removeShare(id) {
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
          paddingTop: 15,
          paddingBottom: 10,
        }}>
          <TouchableOpacity
            activeOpacity={title ? 0 : 1}
            onPress={
              title
              ? () => this.props.navigation.navigate('ShareDetail', {
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
              fontSize: 14,
              color: '#4d4d4d',
              lineHeight: 24,
              marginTop: 10
            }}>{summary}</Text>
          </TouchableOpacity>
          <View style={{
            marginTop: 5,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Text 
              style={{
                flex: 1,
                fontSize: 14,
                color: '#666'
              }}
              numberOfLines={1}
            >作者：{author && author.panname || ''}</Text>
          {isThanked
            ? (<Text style={{
                color: '#999', 
                fontSize: 14,
                padding: 10
              }}>已赞叹</Text>)
            : (<TouchableOpacity
                  style={{
                    padding: 10
                  }}
                  onPress={() => this.thank(_id)}
                >
                  <Text style={{ 
                    fontSize: 14,
                    color: '#666'
                  }}>赞叹</Text>
                </TouchableOpacity>)}
            {
              curUserId && curUserId === creator_id
               ? (<TouchableOpacity
                    style={{
                      padding: 10
                    }}
                    onPress={() => {
                      this.props.navigation.navigate('ShareEditor', {
                        itemId: _id,
                        itemColumn: column_id,
                        onGoBack: () => this.props.onRefresh()
                      })}
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
                    onPress={() => this.removeShare(_id)}
                  >
                    <Text style={{ 
                    fontSize: 14,
                    color: '#666'
                    }}>删除</Text>
                  </TouchableOpacity>)
              : null
            }
            <TouchableOpacity
              style={{
                padding: 10
              }}
              onPress={() => this.props.onReport()}
            >
              <Text style={{ 
                fontSize: 14,
                color: '#666'
              }}>举报</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    )
  }
}

const ShareModal = createFriendModal({
  Report,
  PannameEditor
})

class Share extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      refreshing: false,
      shares: [],
      loading: true,
      noDataTips
    }
  }

  refresh() {
    this.setState({
      refreshing: true
    })
    this.loadData()
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
    if (this.state.loading) {
      this.setState({
        loading: false,
        refreshing: false,
      })
    }
    let { appName, slogan, features, success, shares = [], noDataTips = noDataTips} = data
    if (success) {
      this.props.layoutHomeData({
        appName,
        slogan,
        features
      })
      console.log('refresh finish...')
      this.setState({
        shares,
        noDataTips
      })
    }
  }

  componentWillMount() {
    this.loadData()
  }

  render() {
    let { shares } = this.state
    const { features } = this.props.homeData
    const { userId = '' } = this.props.loginData
    const { routeName } = this.props.navigation.state
    const title = features && features[routeName.toUpperCase()] || ''
    
    return (
      <View style={styles.container}>
        <View style={ styles.header }>
          <Text style={styles.logo}>{ title }</Text>
        </View>
        <View style={globalStyles.headerBottomLine}></View>
        {this.state.shares.length ? <FlatList
          style={{
            padding: 10
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
            onReport={() => this._modal.open('Report')}
          />}
          ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
          keyExtractor={item => (item._id)}
        /> : (<View>
          <Text style={globalStyles.noDataText}>
            {!this.state.loading ? this.state.noDataTips : '加载中...'}
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
              this._modal.open('PannameEditor')
            }
          }}
          style={{
            position: 'absolute',
            width: 48,
            height: 48,
            backgroundColor: '#FF0140',
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
        </TouchableOpacity>
        <ShareModal 
          navigation={this.props.navigation}
          ref={ref => this._modal = ref}
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
  const { loginData, homeData } = state
  return { loginData, homeData }
}

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    layoutHomeData,
  }, dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(Share);
