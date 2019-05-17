/**
 * 尘模块
 */

import React, { Component } from 'react'
import { 
  ScrollView, 
  View, 
  Text, 
  Platform
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from 'app/HomeActions'
import Swiper from 'app/component/SwiperList'
import { get } from 'app/component/request'
import { Empty } from 'app/component/ListLoad'
import { createFriendModal } from 'app/component/GlobalModal'
import globalStyles from 'app/component/globalStyles'
import Quote from 'app/component/Quote'
import Report from 'app/component/Report'
import TYRefreshCtrol from 'app/HorizontalList/RefreshControl'
import EarthItem from 'app/Earth/EarthItem'
import Guide from 'app/Earth/Guide'

// 引用和举报弹窗
const MindModal = createFriendModal({ 
  Guide,
  Quote,
  Report
})

// 横向滑动心事幻灯列表
class EarthSwiper extends Component {

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      loading: true,
      needBack: false,
      minds: [],
      page: 1
    }
  }

  static navigationOptions = {
    gesturesEnabled: false
  }

  layoutData(data, isLoadMore) {
    let { 
      appName, 
      slogan, 
      features, 
      pageInfo,
      minds = []
    } = data
    this.props.layoutHomeData({
      appName,
      slogan,
      features
    })
    let oldMinds = this.state.minds
    , lastIndex = oldMinds.length - 1
    , lastMind = oldMinds[lastIndex]
    if (lastMind && lastMind.isLoading) {
      oldMinds.splice(lastIndex, 1)
    }
    let newMinds = [...oldMinds, ...minds, {
      _id: 'loading',
      isLoading: true
    }]
    , needBack = false
    if ((!minds || !minds.length) && isLoadMore) {
      needBack = true
    }
    this.setState({
      page: pageInfo.nextPage || this.state.page,
      minds: newMinds,
      needBack
    })
  }

  async loadData(needShowGuide, isLoadMore) {
    const { page, loading, refreshing } =  this.state
    let data = await get('earth', {
      perPage: 1,
      page
    })
    if (loading) {
      this.setState({
        loading: false,
        refreshing: false,
      }, () => {
        data && this.layoutData(data, isLoadMore)
        needShowGuide && this._modal.open('Guide')
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
    console.log('loadMore...', page, loading)
    if (!page || loading) return
    this.setState({
      loading: true,
      needBack: false
    }, () => {
      this.loadData(false, true)
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.homeData.launch === false) {
      // App启动时
      if (nextProps.homeData.launch !== this.props.homeData.launch) {
        console.log('App启动后......')
        this.loadData(true)
      }
    } else {
      // 账号切换时
      if (nextProps.loginData.userId !== this.props.loginData.userId) {
        console.log('账号切换后......')
        this.reload()
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    console.log('允许启动结束渲染......', nextProps.homeData.launch || this.props.homeData.launch)
    return nextProps.homeData.launch || this.props.homeData.launch
  }

  render() {
    console.log('启动结束渲染......')
    const { homeData, navigation } = this.props
    const { features } = homeData
    const { routeName } = navigation.state
    const title = features && features[routeName.toUpperCase()] || ''
    let { 
      minds, 
      loading, 
      refreshing,
      needBack
    } = this.state

    return (
      <View style={{ 
        flex: 1,
        backgroundColor: '#fff'
      }}>
        <View style={ globalStyles.header }>
          <Text style={globalStyles.logo}>{ title }</Text>
        </View>
        {
          minds && minds.length 
            ? <Swiper
                ref={ref => this.swiper = ref}
                style={{ flex: 1 }}
                refreshing={refreshing}
                onRefresh={this.refresh}
                onPageEnded={this.loadMore}
                swipeData={minds}
                needBack={needBack}
                renderSwipeItem={(mind, index) => <EarthItem
                  isSwipe={true}
                  mind={mind}
                  navigation={navigation}
                  onQuote={() => this._modal.open('Quote', {
                    classic: mind,
                    quoteType: 'mind',
                    feature: 'earth'
                  })}
                  onReport={() => this._modal.open('Report')}
                />}
              /> 
            : (!loading ? <ScrollView 
            refreshControl={
              <TYRefreshCtrol
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
            horizontal
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          ><Text
          style={{
           fontSize: 16,
           color: '#999',
           textAlign: 'center',
           lineHeight: 28
         }}
       >
         您和您的有缘人之外，没有其他人分享心事~
       </Text></ScrollView> : <Empty loading={true} />)}
        <MindModal 
          ref={ref => this._modal = ref}
          navigation={this.props.navigation}
          refReply={(help, classic, quoteType) => {
            this.props.navigation.navigate('QuoteEditor', {
              type: 'reply',
              help,
              classic,
              quoteType
            })
          }}
        />
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

export default connect(mapStateToProps, mapDispatchToProps)(EarthSwiper);
