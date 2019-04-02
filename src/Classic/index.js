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

let noDataTips = '当前没有内容'

const quotes = [
  {
    id: 'reply',
    name: '回复',
    press() {
      this.props.modal.close()
      this.props.navigation.navigate('HelpSelect', {
        onGoBack: (help) => this.props.refReply(
          help, this.selectedClassic
        )
      })
    }
  },
  {
    id: 'share',
    name: '心得',
    press() {
      this.props.modal.close()
      this.props.navigation.navigate('QuoteEditor', {
        type: 'share',
        classic: this.selectedClassic
      })
    }
  },
  {
    id: 'help',
    name: '心结',
    press() {
      this.props.modal.close()
      this.props.navigation.navigate('QuoteEditor', {
        type: 'help',
        classic: this.selectedClassic
      })
    }
  },
  {
    id: 'weixin',
    name: '微信',
  }
]

class Recommend extends React.Component {

  constructor(props) {
    super(props)
    this.selectedClassic = props.modal.getParam('classic')
  }

  render() {
    return (
      <TouchableOpacity 
        activeOpacity={1} 
        onPressOut={() => this.props.modal.close()}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}
      >
        <View style={{
          width: 250,
          backgroundColor: 'white',
          borderRadius: 3,
          padding: 10
        }}>
          <View style={{
            paddingVertical: 10
          }}>
            <Text style={{
              color: '#666',
              fontSize: 14,
            }}>引用到:</Text>
          </View>
          {quotes.map((quote, index) => (<View
            key={quote.id}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{
                padding: 15,
              }}
              onPress={() => {
                quote.press.call(this)
              }}>
              <Text style={{
                textAlign: 'center',
                fontSize: 16
              }}>{quote.name}</Text>
            </TouchableOpacity>
            {index < quotes.length - 1 ? <View style={globalStyles.splitLine}></View> : null}
          </View>))}
        </View>
      </TouchableOpacity>
    )
  }
}

const RecommendModal = createFriendModal({ 
  Recommend
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
    let data = await get('features/classic', {
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
