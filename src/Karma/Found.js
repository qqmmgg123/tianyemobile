import React, { Component } from 'react'
import { ScrollView, View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { connect } from 'react-redux'
import Swiper from 'app/component/SwiperList'
import { get, post } from 'app/component/request'
import TYicon from 'app/component/TYicon'
import Back from 'app/component/Back'
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
      mind: props.mind
    }
  }

  async thank() {
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
  
  render() {
    let { mind } = this.state
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
          backgroundColor: '#f5f6f7'
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
                color='#FF0140'></TYicon>
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

class FoundSwiper extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      minds: []
    }
  }

  static navigationOptions = {
    gesturesEnabled: false
  }

  refresh() {
    this.loadData()
  }

  componentWillMount() {
    this.loadData()
  }

  async loadData() {
    let data = await get('features/found')
    if (data) {
      let { success, minds } = data
      if (success) {
        this.setState({
          minds,
          loading: false
        })
      }
    }
  }

  render() {
    let { minds } = this.state

    return (
      <View style={{ 
        flex: 1,
        backgroundColor: '#fff'
      }}>
        <Back 
          name="随缘"
          navigation={this.props.navigation} 
        />
        {
          minds && minds.length 
            ? <Swiper
                style={{ flex: 1 }}
                swipeData={minds}
                renderSwipeItem={(mind, index) => <MindDetail
                  mind={mind}
                  onReport={() => this._modal.open('Report')}
                />}
              /> 
            : <View
                style={{
                  flex: 1,
                  padding: 10,
                  justifyContent: 'center',
                  alignItems: 'center'
                }} 
              >
                <Text
                   style={{
                    fontSize: 16,
                    color: '#999',
                    textAlign: 'center',
                    lineHeight: 28
                  }}
                >
                  没数据...
                </Text>
              </View>}
        <MindModal 
          ref={ref => this._modal = ref}
        />
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  const { loginData } = state
  return { loginData }
}

export default connect(mapStateToProps)(FoundSwiper);
