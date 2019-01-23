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
import { Empty, Footer } from './component/ListLoad'

let noDataTips = '当前没有内容'

const ANIMATION_DURATION = 250

class ShareItem extends React.Component {

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

  async removeShare(id) {
    const res = await del(`share/${id}`)
    if (res.success) {
      this.onRemove()
    }
  }

  async loadShare(shareId) {
    let data = await get(`share/${shareId}`)
    if (data) {
      let { success, share } = data
      let { content } = share
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

  thank(id) {
    const { updateShares } = this.props
    updateShares(id)
  }

  render() {
    const rowStyles = [
      { opacity: this._animated }
    ]
    const { title = '', curUserId, creator_id, _id, isThanked, author, column_id, is_extract } = this.props
    const { text, content, expand } = this.state
    return (
      <Animated.View style={rowStyles}>
        <View style={{
          paddingTop: 15,
          paddingBottom: 10,
        }}>
          <TouchableOpacity
            activeOpacity={title ? 0.6 : 1}
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
                  this.loadShare(_id)
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
          <View style={{
            marginTop: 5,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('Profile', {
              itemId: author._id
            })}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingRight: 10
            }}
          >
            <Text 
              style={{
                fontSize: 14,
                color: '#666'
              }}
              numberOfLines={1}
            >
              作者：{author && author.panname || ''}
            </Text>
          </TouchableOpacity>
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
      noDataTips,
      page: 1
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

  layoutData(data) {
    let { 
      appName, 
      slogan, 
      features, 
      success, 
      pageInfo,
      shares = [], 
      noDataTips = noDataTips} = data
    if (success) {
      this.props.layoutHomeData({
        appName,
        slogan,
        features
      })
      this.setState({
        page: pageInfo.nextPage || 0,
        shares: [...this.state.shares, ...shares],
        noDataTips
      })
    }
  }

  async loadData() {
    const { page, loading, refreshing } =  this.state
    let data = await get('features/share',  {
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
        shares: []
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
    let { shares } = this.state
    shares.splice(index, 1)
    this.setState({
      shares
    })
  }

  componentWillMount() {
    this.loadData()
  }

  render() {
    const { features } = this.props.homeData
    const { userId = '' } = this.props.loginData
    const { routeName } = this.props.navigation.state
    const title = features && features[routeName.toUpperCase()] || ''

    let { 
      shares, 
      refreshing, 
      loading, 
      noDataTips, 
      page 
    } = this.state
    
    return (
      <View style={styles.container}>
        <View style={ styles.header }>
          <Text style={styles.logo}>{ title }</Text>
        </View>
        <View style={globalStyles.headerBottomLine}></View>
        <FlatList
          style={{
            padding: 10
          }}
          data={shares}
          refreshing={refreshing}
          onRefresh={this.refresh}
          onEndReached={this.loadMore}
          onEndReachedThreshold={100}
          renderItem={({item, index}) => <ShareItem
            navigation={this.props.navigation}
            {...item} 
            curUserId={userId}
            onRemove={this.removeItem.bind(this, index)} 
            onRefresh={() => this.refresh()}
            updateShares={this.updateShares.bind(this)}
            onReport={() => this._modal.open('Report')}
          />}
          ListEmptyComponent={<Empty 
            loading={loading}
            noDataTips={noDataTips}
          />}
          ListFooterComponent={<Footer 
            data={shares} 
            onLoadMore={this.loadMore} 
            loading={loading}
            page={page}
            noDataTips={noDataTips}
          />}
          ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
          keyExtractor={item => (item._id)}
        />
        <TouchableOpacity 
          onPress={() => {
            let userInfo = getUserInfo()
            if (userInfo && userInfo.panname) {
              this.props.navigation.navigate('ShareEditor', {
                onGoBack: () => this.refresh()
              })
            } else {
              if (userInfo) {
                this._modal.open('PannameEditor')
              } else {
                this.props.navigation.navigate('Login')
              }
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
