import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Spinner from 'react-native-loading-spinner-overlay'
import { changeLoginState } from './HomeActions'
import { KeyboardAvoidingView, View, TouchableOpacity, TextInput, Text } from 'react-native'
import globalStyles from './globalStyles'
import { toast } from './Toast'
import { post, updateUser, getUserInfo } from './request'

class PannnameEditor extends Component {

  constructor(props) {
    super(props)
    this.state = {
      panname: '',
      spinner: false,
      spinnerText: ''
    }
  }

  createPanname = async () => {
    let { panname } = this.state
    panname = panname.trim()
    if (!panname) {
      toast('笔名不能填空。')
      return
    }

    this.setState({
      spinner: true,
      spinnerText: '',
    })
    const res = await post('panname', {
      panname
    })
    this.setState({
      spinner: false,
      spinnerText: '',
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
    const { panname = '', spinner, spinnerText } = this.state

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior='height'
      >
        <Spinner
          visible={spinner}
          textContent={spinnerText}
          textStyle={{
            color: '#333'
          }}
          color='#666'
          overlayColor='rgba(255,255,255, 0.25)'
        />
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
            <Text style={{
              color: '#666',
              fontSize: 14,
              lineHeight: 24
            }}>抱歉，为保护您的隐私，需要您给自己取一个，仅对外的笔名。</Text>
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
                style={[
                  globalStyles.button, 
                  !panname.trim() ? globalStyles.buttonDis : null, 
                  { 
                    marginTop: 10,
                    flex: 1 
                  }
                ]}
                onPress={!panname.trim() ? null : this.createPanname}
              >
                <Text style={[
                  globalStyles.buttonText, 
                  !panname.trim() ? globalStyles.buttonDisText : null
                ]}>确定</Text>
              </TouchableOpacity>
              <View style={{ width: 10 }} />
              <TouchableOpacity
                style={[globalStyles.button, { 
                  marginTop: 10,
                  flex: 1 
                }]}
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
