import React from 'react'
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  Text, 
} from 'react-native'
import TalkEmptyGuide from 'app/Friend/TalkEmptyGuide'
import { get } from 'app/component/request'
import globalStyles from 'app/component/globalStyles'
import Back from 'app/component/Back'
import { Empty, Footer } from 'app/component/ListLoad'

class HelpItem extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { 
      title,
      summary = '', 
      _id, 
      author, 
      friend
    } = this.props
    , creatorname = (friend && friend.remark) || (author && author.nickname) || ''
    return (
        <TouchableOpacity 
          onPress={() => {
            this.props.navigation.goBack()
            this.props.navigation.state.params.onGoBack({ _id, summary });
          }}
          style={{
            paddingTop: 10,
          }}
        >
          <View>
            <Text style={{ 
              fontSize: 14,
              color: '#333',
              lineHeight: 24
              }}>{creatorname}：</Text>
            <Text style={{ 
              marginTop: 5,
              fontSize: 14,
              color: '#333',
              lineHeight: 24
              }}>{summary}</Text>
          </View>
        </TouchableOpacity>
    )
  }
}

export default class HelpSelect extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      friendTotal: 0,
      refreshing: false,
      helps: [],
      loading: true,
      page: 1
    }
  }

  layoutData(data) {
    let { 
      success,
      friendTotal,
      pageInfo, 
      helps = [], 
    } = data
    if (success) {
      this.setState({
        page: pageInfo.nextPage || 0,
        helps: [...this.state.helps, ...helps],
        friendTotal
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
      friendTotal,
      helps, 
      refreshing, 
      loading, 
      page 
    } = this.state
    const { navigation } = this.props

    return (
      <View 
        style={globalStyles.container}
      >
        <Back 
          name='选择您要回复的谈心主题'
          navigation={this.props.navigation} 
        />
        {
          helps && helps.length 
            ? <FlatList
                contentContainerStyle={{
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
                ListFooterComponent={<Footer 
                  data={helps} 
                  onLoadMore={this.loadMore} 
                  loading={loading}
                  page={page}
                />}
                ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
                keyExtractor={(item) => (item._id)}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              />
            : (
                !loading 
                  ? <TalkEmptyGuide 
                      navigation={navigation}
                      friendTotal={friendTotal} 
                    /> 
                  : <Empty loading={true} />
              )
        }
      </View>
    )
  }
}
