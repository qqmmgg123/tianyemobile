import React from 'react'
import { View, FlatList, TouchableOpacity, Text, Animated } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from './HomeActions';
import { get, del } from './request'
import globalStyles from './globalStyles'
import { getDate } from './utils'
import Back from './component/Back'
import { Empty, Footer } from './component/ListLoad'

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
    const { content, updated_date, _id } = this.props

    return (
      <Animated.View style={rowStyles}>
        <View style={{
          padding: 10
        }}>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate('Diary', {
                itemId: _id,
              })
            }}
          >
            <Text style={{ 
              fontSize: 16,
              color: '#333333',
              lineHeight: 24
              }}>{content}</Text>
          </TouchableOpacity>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Text style={{ 
              fontSize: 14,
              color: '#999999',
              flex: 1,
            }}>
              {getDate(new Date(updated_date))}
            </Text>
            <TouchableOpacity
              style={{
                padding: 10
              }}
              onPress={() => {
                this.props.navigation.navigate('Diary', {
                  itemId: _id,
                })
              }}
            >
              <Text style={{ 
              fontSize: 14,
              color: '#666',
              }}>编辑</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.removeDiary(_id)}
            >
              <Text style={{ 
                fontSize: 14,
                color: '#666',
                padding: 10
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
      refreshing: false,
      diarys: [],
      loading: true,
      noDataTips,
      page: 1
    }
  }

  layoutData(data) {
    let { 
      appName, 
      slogan, 
      features, 
      success, 
      pageInfo,
      diarys = [], 
      noDataTips = noDataTips } = data
    if (success) {
      this.props.layoutHomeData({
        appName,
        slogan,
        features
      })
      this.setState({
        page: pageInfo.nextPage || 0,
        diarys: [...this.state.diarys, ...diarys],
        noDataTips
      })
    }
  }

  async loadData() {
    const { page, loading, refreshing } =  this.state
    let data = await get('features/diary', {
      perPage: 20,
      page
    })
    if (loading) {
      this.setState({
        loading: false
      }, () => {
        data && this.layoutData(data)
      })
    }
    if (refreshing) {
      this.setState({
        refreshing: false,
        diarys: []
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
    let { diarys } = this.state
    diarys.splice(index, 1)
    this.setState({
      diarys
    })
  }

  componentWillMount() {
    this.loadData()
  }

  render() {
    let { 
      diarys, 
      refreshing, 
      loading, 
      noDataTips, 
      page 
    } = this.state

    return (
      <View style={{flex: 1}}>
        <Back navigation={this.props.navigation} />
        <FlatList
          style={{
            padding: 10
          }}
          data={diarys}
          refreshing={refreshing}
          onRefresh={this.refresh}
          onEndReached={this.loadMore}
          onEndReachedThreshold={100}
          renderItem={({item, index}) => <DiaryItem 
            {...item} 
            navigation={this.props.navigation}
            onRemove={this.removeItem.bind(this, index)} 
          />}
          ListEmptyComponent={<Empty 
            loading={loading}
            noDataTips={noDataTips}
          />}
          ListFooterComponent={<Footer 
            data={diarys} 
            onLoadMore={this.loadMore} 
            loading={loading}
            page={page}
            noDataTips={noDataTips}
          />}
          ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
          keyExtractor={(item) => (item._id)}
        />
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
