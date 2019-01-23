import React from 'react'
import { View, FlatList, TouchableOpacity, Text, TextInput, SafeAreaView, Modal, KeyboardAvoidingView, Animated, findNodeHandle, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from './HomeActions';
import { get, post, del, getUserInfo } from './request'
import globalStyles from './globalStyles'
import TYicon from './TYicon'
import Back from './component/Back'
import { Empty, Footer } from './component/ListLoad'

let noDataTips = '当前没有内容'

class HelpItem extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { 
      content = '', 
      replies, 
      _id, 
      creator_id, 
      reply_count, 
      remark = [], 
      username = '' } = this.props
    return (
        <TouchableOpacity 
          onPress={() => {
            this.props.navigation.goBack()
            this.props.navigation.state.params.onGoBack({ _id, content });
          }}
          style={{
            paddingTop: 10,
            // paddingBottom: 15
          }}
        >
          <View>
            <Text style={{ 
              fontSize: 14,
              color: '#333',
              lineHeight: 24
              }}>{remark[0] || username}：</Text>
            <Text style={{ 
              marginTop: 5,
              fontSize: 14,
              color: '#333',
              lineHeight: 24
              }}>{content}</Text>
          </View>
        </TouchableOpacity>
    )
  }
}

class Help extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      helps: [],
      loading: true,
      noDataTips,
      page: 1
    }
  }

  layoutData(data) {
    let { 
      success,
      pageInfo, 
      helps = [], 
      noDataTips = noDataTips } = data
    if (success) {
      this.setState({
        page: pageInfo.nextPage || 0,
        helps: [...this.state.helps, ...helps],
        noDataTips
      })
    }
  }

  async loadData() {
    const { page, loading, refreshing } =  this.state
    let data = await get(`recommend/helps`, {
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
        helps: []
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

  componentWillMount() {
    this.loadData()
  }

  render() {
    let { 
      helps, 
      refreshing, 
      loading, 
      noDataTips, 
      page 
    } = this.state

    return (
      <View style={{flex: 1}}>
        <Back navigation={this.props.navigation} />
        <View style={globalStyles.splitLine}></View>
        <FlatList
          style={{
            padding: 10
          }}
          data={helps}
          refreshing={refreshing}
          onRefresh={this.refresh}
          onEndReached={this.loadMore}
          onEndReachedThreshold={100}
          renderItem={({item}) => <HelpItem 
            navigation={this.props.navigation}
            {...item} 
          />}
          ListEmptyComponent={<Empty 
            loading={loading}
            noDataTips={noDataTips}
          />}
          ListFooterComponent={<Footer 
            data={helps} 
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
  const { homeData } = state
  return { homeData }
}

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    layoutHomeData,
  }, dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(Help);
