import React from 'react'
import { View, FlatList, TouchableOpacity, Text, Animated } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from 'app/HomeActions';
import { get, del } from 'app/component/request'
import globalStyles from 'app/component/globalStyles'
import { getDate } from 'app/utils'
import Back from 'app/component/Back'
import { Empty, Footer } from 'app/component/ListLoad'

let noDataTips = '当前没有内容'

const ANIMATION_DURATION = 250

class TranslateItem extends React.Component {

  constructor(props) {
    super(props)
    this._animated = new Animated.Value(1);
  }

  async removeTranslate(id) {
    const res = await del(`translate/${id}`)
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
    const { title, _id, creator_id, curUserId, navigation } = this.props

    return (
      <Animated.View style={rowStyles}>
        <TouchableOpacity 
          style={{
            padding: 10
          }}
          onPress={() => navigation.navigate('ClassicTranslate', {
            itemId: _id
          })}
        >
          <View>
            <Text style={{ 
              fontSize: 16,
              color: '#333333',
              lineHeight: 24
              }}>{title}</Text>
          </View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {
              curUserId && curUserId === creator_id
               ? (<TouchableOpacity
                    style={{
                      padding: 10
                    }}
                    onPress={() => removeTranslate(_id)}
                  >
                    <Text style={{ 
                      fontSize: 14,
                      color: '#666',
                      padding: 10
                    }}>删除</Text>
                  </TouchableOpacity>)
              : null
            }
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }
}

class TranslateList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      translates: [],
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
      translates = [], 
      noDataTips = noDataTips } = data
    if (success) {
      this.props.layoutHomeData({
        appName,
        slogan,
        features
      })
      this.setState({
        page: pageInfo.nextPage || 0,
        translates: [...this.state.translates, ...translates],
        noDataTips
      })
    }
  }

  async loadData() {
    const { page, loading, refreshing } =  this.state
    const sectionId = this.props.navigation.getParam('itemId')
    let data = await get(`section/${sectionId}/translates`, {
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
        translates: []
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
    let { translates } = this.state
    translates.splice(index, 1)
    this.setState({
      translates
    })
  }

  componentWillMount() {
    this.loadData()
  }

  render() {
    const { userId = '' } = this.props.loginData
    let { 
      translates, 
      refreshing, 
      loading, 
      noDataTips, 
      page 
    } = this.state

    return (
      <View style={{flex: 1}}>
        <Back navigation={this.props.navigation} />
        <FlatList
          contentContainerStyle={{
            padding: 10
          }}
          data={translates}
          refreshing={refreshing}
          onRefresh={this.refresh}
          onEndReached={this.loadMore}
          onEndReachedThreshold={100}
          renderItem={({item, index}) => <TranslateItem 
            curUserId={userId}
            navigation={this.props.navigation}
            {...item} 
            onRemove={this.removeItem.bind(this, index)} 
          />}
          ListEmptyComponent={<Empty 
            loading={loading}
            noDataTips={noDataTips}
          />}
          ListFooterComponent={<Footer 
            data={translates} 
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

const mapStateToProps = (state) => {
  const { loginData } = state
  return { loginData }
}

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    layoutHomeData,
  }, dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(TranslateList)
