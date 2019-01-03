import React from 'react'
import { View, FlatList, TouchableOpacity, Text, TextInput, SafeAreaView, Modal, KeyboardAvoidingView, Animated, findNodeHandle, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from './HomeActions';
import { get, post, del, getUserInfo } from './request'
import globalStyles from './globalStyles'
import TYicon from './TYicon'
import Back from './component/Back'

let noDataTips = '当前没有内容'

class HelpItem extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { content = '', replies, _id, creator_id, reply_count, remark = [], username = '' } = this.props
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
      helps: [],
      noDataTips,
    }
  }

  refresh() {
    this.loadData()
  }

  async loadData() {
    let res = await get(`recommend/helps`)
    if (res) {
      let { success, helps = [], noDataTips = noDataTips } = res
      if (success) {
        this.setState({
          helps,
          noDataTips
        })
      }
    }
  }

  componentWillMount() {
    this.loadData()
  }

  render() {
    return (
      <View
        style={styles.container}
      >
        <Back navigation={this.props.navigation} />
        <View style={globalStyles.splitLine}></View>
        {this.state.helps.length ? <FlatList
          style={{
            paddingHorizontal: 15,
            paddingBottom: 15
          }}
          data={this.state.helps}
          renderItem={({item, index}) => <HelpItem 
            navigation={this.props.navigation}
            {...item} 
          />}
          ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
          keyExtractor={(item) => (item._id)}
        /> : (<View>
          <Text style={{
            color: '#333333',
            textAlign: 'center',
            paddingTop: 20
          }}>
            {this.state.noDataTips}
          </Text>
        </View>)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 42,
    paddingLeft: 10
  },
  logo: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FF0140'
  },
  slogan: {
    textAlign: 'center',
    color: 'orange'
  },
})

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
