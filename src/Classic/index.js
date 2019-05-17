import React from 'react'
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  Text, 
  ScrollView,
  RefreshControl,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from 'app/HomeActions'
import { get } from 'app/component/request'
import globalStyles from 'app/component/globalStyles'
import { createFriendModal } from 'app/component/GlobalModal'
import { Empty, Footer } from 'app/component/ListLoad'
import Quote from 'app/component/Quote'

let noDataTips = '当前没有内容'

const RecommendModal = createFriendModal({ 
  Quote
})

class Classic extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      classics: [],
      loading: true,
      noDataTips,
      page: 1
    }
  }

  layoutData(data) {
    let { 
      appName, 
      slogan, 
      message = [],
      features, 
      success, 
      pageInfo,
      classics = [], 
      noDataTips = noDataTips } = data
    if (success) {
      this.props.layoutHomeData({
        appName,
        slogan,
        features,
        message,
      })
      this.setState({
        page: pageInfo.nextPage || 0,
        classics: [...this.state.classics, ...classics],
        noDataTips
      })
    }
  }

  async loadData() {
    const { page, loading, refreshing } =  this.state
    let data = await get('classic', {
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
        classics: []
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
    const { features } = this.props.homeData
    const { routeName } = this.props.navigation.state
    const title = features && features[routeName.toUpperCase()] || ''
    let { 
      classics, 
      refreshing, 
      loading, 
      noDataTips, 
      page 
    } = this.state

    return (
      <View style={globalStyles.container}>
        <View style={ globalStyles.header }>
          <Text style={globalStyles.logo}>{ title }</Text>
        </View>
        <View style={globalStyles.headerBottomLine}></View>
        {classics && classics.length ? <FlatList
          contentContainerStyle={{
            padding: 10
          }}
          data={classics}
          refreshing={refreshing}
          onRefresh={this.refresh}
          onEndReached={this.loadMore}
          onEndReachedThreshold={100}
          renderItem={({item}) => {
            return (
              <View style={{
                paddingTop: 15,
                paddingBottom: 10,
              }}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate('ClassicDetail', {
                    itemId: item._id
                  })}
                >
                  <Text style={{ 
                    fontSize: 16,
                    color: '#333',
                    lineHeight: 24
                   }}>{item.title}</Text>
                  <Text style={{ 
                    fontSize: 14,
                    color: '#4d4d4d',
                    lineHeight: 24,
                    marginTop: 10
                   }}>{item.summary}</Text>
                </TouchableOpacity>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}>
                  <TouchableOpacity
                    style={{
                      padding: 10
                    }}
                    onPress={() => this._modal.open('Recommend', {
                      classic: item
                    })}
                  >
                    <Text style={{ 
                      fontSize: 14,
                      color: '#666'
                    }}>引用</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          }}
          ListFooterComponent={<Footer 
            data={classics} 
            onLoadMore={this.loadMore} 
            loading={loading}
            page={page}
          />}
          ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
          keyExtractor={(item) => (item._id)}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        /> : (!loading ? <ScrollView 
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
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Text
            style={globalStyles.noDataText}
          >
            {noDataTips}
          </Text>
        </ScrollView> : <Empty loading={true} />)}
        <RecommendModal 
          navigation={this.props.navigation}
          ref={ ref => this._modal = ref }
          refReply={(help, classic) => {
            this.props.navigation.navigate('QuoteEditor', {
              type: 'reply',
              help,
              classic
            })
          }}
        />
      </View>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(Classic);
