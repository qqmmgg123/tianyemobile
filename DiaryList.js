import React from 'react'
import { View, FlatList, TouchableOpacity, Text, Animated } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from './HomeActions';
import { get, del } from './request'
import globalStyles from './globalStyles'
import { getDate } from './utils'
import Back from './component/Back'

let noDataTips = '当前没有内容'

const ANIMATION_DURATION = 250

class DiaryItem extends React.Component {

  constructor(props) {
    super(props)
    this._animated = new Animated.Value(1);
  }

  async removeDiary(id) {
    const res = await del(`diary/${id}`)
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

  render() {
    const rowStyles = [
      { opacity: this._animated }
    ]
    const { content, created_date, _id } = this.props

    return (
      <Animated.View style={rowStyles}>
        <View style={{
          padding: 10
        }}>
          <TouchableOpacity>
            <Text style={{ 
              fontSize: 16,
              color: '#333333',
              lineHeight: 24
              }}>{content}</Text>
          </TouchableOpacity>
          <Text style={{ 
            fontSize: 12,
            color: '#999999',
            lineHeight: 24
          }}>
            {getDate(new Date(created_date))}
          </Text>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}>
            <TouchableOpacity
              onPress={() => this.removeDiary(_id)}
            >
              <Text style={{ 
              fontSize: 12,
              color: '#7094b7',
              height: 27,
              lineHeight: 27,
              paddingRight: 14
              }}>删除</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    )
  }
}

class DiaryList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      diarys: [],
      noDataTips
    }
  }

  refresh() {
    this.loaderData()
  }

  async loaderData() {
    let data = await get('features/diary')
    let { appName, slogan, features, success, diarys = [], noDataTips = noDataTips } = data
    console.log(data, diarys)
    if (success) {
      this.props.layoutHomeData({
        appName,
        slogan,
        features
      })
      this.setState({
        diarys,
        noDataTips
      })
    }
  }

  componentWillMount() {
    this.loaderData()
  }

  render() {
    let { diarys } = this.state

    return (
      <View style={{flex: 1}}>
        <Back navigation={this.props.navigation} />
        {this.state.diarys.length ? <FlatList
          style={{
            marginTop: 10
          }}
          data={this.state.diarys}
          renderItem={({item, index}) => <DiaryItem 
            {...item} 
            onRemove={() => {
              diarys.splice(index, 1)
              this.setState({
                diarys
              })
            }} 
          />}
          ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
          keyExtractor={(item) => (item._id)}
        /> : (<View>
          <Text style={{
            color: '#333333',
            textAlign: 'center'
          }}>
            {this.state.noDataTips}
          </Text>
        </View>)}
      </View>
    )
  }
}

const mapStateToProps = null

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    layoutHomeData,
  }, dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(DiaryList)