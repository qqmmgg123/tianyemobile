import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, TouchableOpacity, TextInput, Text } from 'react-native'
import globalStyles from './globalStyles'
import { toast } from './Toast'
import { updateUser } from './request'

class PannnameEditor extends Component {

  constructor(props) {
    super(props)
    this.state = {
      panname: ''
    }
  }

  async createPanname() {
    let { panname } = this.state
    panname = panname.trim()
    if (!panname) {
      toast('笔名不能填空。')
      return
    }

    const res = await post('panname', {
      panname
    })
    if (res.success) {
      let userInfo = getUserInfo()
      userInfo.panname = panname
      this.props.changeLoginState({
        panname
      })
      updateUser(userInfo)
      this.props.modal.close()
      this.props.navigation.navigate('ShareEditor')
    }
  }
  
  render() {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior='height'
      >
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
            <Text>抱歉，需要您给自己取一个对外的笔名，以保护您的隐私</Text>
            <TextInput
              autoFocus={true}
              style={{
                borderColor: '#cccccc', 
                borderWidth: 1,
                paddingTop: 3,
                paddingHorizontal: 7,
                paddingBottom: 4,
                borderRadius: 3,
                marginTop: 10,
                minHeight: 36
              }}
              placeholder='您的笔名'
              placeholderTextColor="#cccccc"
              autoCapitalize="none"
              onChangeText={(panname) => this.setState({panname})}
              value={this.state.panname}
            />
            <View style={{
              flexDirection: 'row'
            }}>
              <TouchableOpacity
                style={globalStyles.button}
                onPress={() => this.createPanname()}
              >
                <Text style={globalStyles.buttonText}>提交</Text>
              </TouchableOpacity>
              <View style={{ width: 10 }} />
              <TouchableOpacity
                style={globalStyles.button}
                onPress={() => {
                  this.props.modal.close()
                }}>
                <Text style={globalStyles.buttonText}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    )
  }

}

const mapStateToProps = null

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    changeLoginState,
  }, dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(PannnameEditor)
