import React from 'react'
import { View, FlatList, TouchableOpacity, Text, Modal, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from './HomeActions';
import { get } from './request'
import globalStyles from './globalStyles'

let noDataTips = '当前没有内容'

class Classic extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      classics: [],
      noDataTips,
      modalVisible: false
    }
  }

  setModalVisible(visible) {
    this.setState({
      modalVisible: visible
    })
  }

  async componentWillMount() {
    let data = await get('features/classic')
    let { appName, slogan, features, success, classics = [], noDataTips = noDataTips } = data
    if (success) {
      this.props.layoutHomeData({
        appName,
        slogan,
        features
      })
      this.setState({
        classics,
        noDataTips
      })
    }
  }

  render() {
    return (
      <View style={{flex: 1, paddingTop: 20}}>
        {this.state.classics.length ? <FlatList
          style={{
            paddingTop: 3,
            paddingLeft: 7,
            paddingRight: 7,
            paddingBottom: 4
          }}
          data={this.state.classics}
          renderItem={({item}) => {
            return (
              <View style={{
                paddingTop: 5,
                paddingBottom: 5,
              }}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate('ClassicDetail', {
                    itemId: item._id
                  })}
                >
                  <Text style={{ 
                    fontSize: 16,
                    color: '#7094b7',
                    lineHeight: 32
                   }}>{item.title}</Text>
                  <Text style={{ 
                    fontSize: 14,
                    color: '#999999',
                    lineHeight: 24
                   }}>{item.summary}</Text>
                </TouchableOpacity>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}>
                  <TouchableOpacity
                    onPress={() => this.setModalVisible(true)}
                  >
                    <Text style={{ 
                    fontSize: 12,
                    color: '#7094b7',
                    height: 27,
                    lineHeight: 27,
                    paddingRight: 14
                   }}>推荐</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          }}
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
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {this.setModalVisible(false)}}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPressOut={() => this.setModalVisible(false)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)'
            }}
          >
            <View style={{
              width: 250,
              height: 150,
              backgroundColor: 'white',
              borderRadius: 3,
              padding: 10
            }}>
              <View style={{
                paddingVertical: 10
              }}>
                <Text>推荐到:</Text>
              </View>
              <TouchableOpacity
                style={globalStyles.button}
                onPress={() => {
                  this.setModalVisible(false)
                }}>
                <Text style={globalStyles.buttonText}>排忧解难</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }
}

const mapStateToProps = null

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    layoutHomeData,
  }, dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(Classic);
