import React, { Component } from 'react'
import { ScrollView, RefreshControl, View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from 'app/HomeActions'
import Swiper from 'app/component/SwiperList'
import { get, post, getUserByMemory } from 'app/component/request'
import TYicon from 'app/component/TYicon'
import globalStyles from 'app/component/globalStyles'
import { createFriendModal } from 'app/component/GlobalModal'
import Report from 'app/component/Report'
const { width } = Dimensions.get("window");

const types = {
  help: {
    good: {
      name: '理解',
      id: 'understand'
    },
    bad: '无感'
  },
  share: {
    good: {
      name: '认同',
      id: 'thank'
    },
    bad: '无感'
  },
}

class MindDetail extends Component {

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      mind: props.mind
    }
  }

  async thank() {
    let userInfo = getUserByMemory()
    if (!userInfo) {
      this.props.navigation.navigate('Login')
      return
    }

    let { mind } = this.state
    mind = Object.assign({}, mind)
    if (!mind.isThanked && !mind.thanking) {
      mind.thanking = true
      mind.isThanked = true
      this.setState({
        mind,
      })
      const res = await post(`thank/${mind._id}`, {
        typeId: types[mind.type_id].good.id
      })
      mind.thanking = false
      if (res.success) {
        mind.isThanked = true
        this.setState({
          mind
        })
      }
    }
  }

  refresh = () => {
    this.setState({
      refreshing: true
    }, () => {
      this.loadData()
    })
  }

  async loadData() {
    let { _id } = this.state.mind
    , data = await get(`mind/${_id}`)
    if (data) {
      let { success, mind } = data
      if (success) {
        this.setState({
          mind,
          loading: false
        })
      }
    }
  }
  
  render() {
    let { refreshing, mind } = this.state
    let { 
      _id,
      title, 
      content, 
      isThanked, 
      type_id, 
    } = mind
    let { onReport } = this.props

    return <View style={{ flex: 1, width: width }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.refresh}
            />
          }
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {title ? (<View style={{
            flex: 1,
            padding: 10,
          }}>
            <Text
              style={{
                fontSize: 20,
                lineHeight: 32,
                textAlign: 'center'
              }}
            >{title}</Text>
          </View>) : null}
          {content ? (<View style={{
            flex: 1,
            marginTop: 10,
            paddingHorizontal: 10,
            paddingBottom: 20
          }}>
            <Text style={{
              color: '#333333',
              fontSize: 16,
              lineHeight: 28
            }}>
            {content}
            </Text>
          </View>) : null}
        </ScrollView>
      </View>
      <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {isThanked
          ? (
            <TouchableOpacity
              style={{
                padding: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <TYicon 
                style={{
                  marginRight: 10
                }}
                name='xin' 
                size={24} 
                color='#EE3D80'></TYicon>
              <Text style={{
                color: '#999', 
                fontSize: 14,
                padding: 10
              }}>已{types[type_id].good.name}</Text>
            </TouchableOpacity>)
          : (<TouchableOpacity
                style={{
                  padding: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => this.thank(_id)}
              >
                <TYicon 
                  style={{
                    marginRight: 10
                  }}
                  name='xin' 
                  size={24} 
                  color='#ccc'></TYicon>
                <Text style={{ 
                  fontSize: 14,
                  color: '#666'
                }}>{types[type_id].good.name}</Text>
              </TouchableOpacity>)}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10
            }}
            onPress={() => onReport()}
          >
            <TYicon 
              style={{
                marginRight: 10
              }}
              name='jubao' 
              size={24} 
              color='#ccc'></TYicon>
            <Text style={{ 
              fontSize: 14,
              color: '#666'
            }}>举报</Text>
          </TouchableOpacity>
        </View>
      </View>
  }
}

const MindModal = createFriendModal({ Report })

class EarthSwiper extends Component {

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      loading: true,
      minds: []
    }
  }

  static navigationOptions = {
    gesturesEnabled: false
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
      loading: true,
      minds: []
    }, () => {
      this.loadData()
    })
  }

  async loadData() {
    let data = await get('features/earth')
    if (data) {
      let { 
        appName, 
        slogan, 
        features, 
        success, 
        pageInfo,
        minds 
      } = data
      if (success) {
        this.props.layoutHomeData({
          appName,
          slogan,
          features
        })
        console.log('获取到数据...', data)
        this.setState({
          minds,
          loading: false
        })
      }
    }
  }

  componentWillMount() {
    console.log('组件开始装载...')
  }

  componentDidMount() {
    console.log('组件渲染结束...')
  }

  componentDidCatch() {
    console.log('捕获到错误...')
  }

  componentWillUpdate() {
    console.log('组件即将更新...')
  }

  componentDidUpdate() {
    console.log('组件更新结束...')
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.homeData.launch === false) {
      // App启动时
      if (nextProps.homeData.launch !== this.props.homeData.launch) {
        console.log('App启动后......')
        this.loadData()
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
    let { minds, refreshing } = this.state
    // let minds = []

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
                style={{ flex: 1 }}
                refreshing={refreshing}
                onRefresh={this.refresh}
                swipeData={minds}
                renderSwipeItem={(mind, index) => <MindDetail
                  mind={mind}
                  navigation={navigation}
                  onReport={() => this._modal.open('Report')}
                />}
              /> 
            : <ScrollView 
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
         没数据...
       </Text></ScrollView>}
        <MindModal 
          ref={ref => this._modal = ref}
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
