import React from 'react'
import { View, ListView, TouchableOpacity, Dimensions, Text } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { layoutHomeData } from './HomeActions';
import { get } from './request'
import globalStyles from './globalStyles'

const { width } = Dimensions.get('window')

class Diary extends React.Component {

  constructor(props) {
    super(props)
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds
    }
  }

  async componentWillMount() {
    let data = await get('http://192.168.1.6:8080/features/diary')
    let { appName, slogan, features, success, diarys = []} = data
    console.log(data, diarys)
    if (success) {
      this.props.layoutHomeData({
        appName,
        slogan,
        features
      })
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(diarys)
      })
    }
  }


  render() {
    return (
      <View style={{flex: 1, paddingTop: 20}}>
        <ListView
          style={{
            paddingTop: 3,
            paddingLeft: 7,
            paddingRight: 7,
            paddingBottom: 4
          }}
          dataSource={this.state.dataSource}
          renderRow={(rowData) => {
            return (
              <View style={{
                paddingTop: 5,
                paddingBottom: 5,
              }}>
                <TouchableOpacity>
                  <Text style={{ 
                    fontSize: 14,
                    color: '#999999',
                    lineHeight: 24
                   }}>{rowData.content}</Text>
                </TouchableOpacity>
              </View>
            )
          }}
          renderSeparator={(sectionId, rowId) => <View key={rowId} style={globalStyles.separator} />}
        />
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

export default connect(mapStateToProps, mapDispatchToProps)(Diary);
