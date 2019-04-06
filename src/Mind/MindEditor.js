import React from 'react'
import {
  View,
  KeyboardAvoidingView,
  TextInput,
  Text,
  findNodeHandle,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert
} from 'react-native'
import Spinner from 'react-native-loading-spinner-overlay'
import { get, post, put } from 'app/component/request'
import TYicon from 'app/component/TYicon'
import { createFriendModal } from 'app/component/GlobalModal'
import Back from 'app/component/Back'
import TypeSelect from 'app/Mind/TypeSelect'
import { MIND_TYPES, STATUS_BAR_HEIGHT } from 'app/component/Const'



const TypeModal = createFriendModal({ 
  TypeSelect,
})

export default class MindEditor extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      spinner: false,
      spinnerText: '',
      _id: '',
      type_id: 'diary',
      column_id: 'sentence',
      content: ''
    }
  }

  async postMind() {
    const { navigation, listRefresh } = this.props
    const { _id, type_id, content, column_id } = this.state
    this.setState({
      spinner: true,
      spinnerText: '',
    })
    try {
      let res = null
      if (_id) {
        res = await put(`mind/${_id}`, {
          _id: '',
          type_id,
          column_id,
          content
        })
      } else {
        res = await post('mind', {
          _id: '',
          type_id,
          column_id,
          content
        })
      }
      this.setState({
        spinner: false,
        spinnerText: '',
      }, () => {
        if (res) {
          const { success, info } = res
          if (success) {
            navigation.goBack()
            /* if (_id) {
              navigation.navigate('MindDetail', {
                itemId: _id
              })
            } */
            navigation.state.params.onListRefresh()
          } else {
            toast(info)
          }
        }
      })
    } catch (err) {
      this.setState({
        spinner: false,
        spinnerText: '',
      })
    }
  }

  async componentWillMount() {
    const { navigation } = this.props
    const _id = navigation.getParam('itemId')
    if (_id) {
      let data = await get(`mind/${_id}`)
      this.setState({loading: false}, () => {
        if (data) {
          let { success, mind } = data
          const { content = '', type_id = 'diary' } = mind
          if (success) {
            this.setState({
              type_id,
              _id,
              content,
            })
          }
        }
      })
    } else {
      const type_id = navigation.getParam('itemTypeId')
      this.setState({
        loading: false,
        _id: '',
        type_id,
        column_id: 'sentence',
        content: '',
      })
    }
  }

  saveToDiary = () => {
    const { navigation } = this.props
    this.setState({
      type_id: 'diary',
    }, () => {
      this.postMind()
    })
  }

  closeEditor = () => {
    const { content = '', _id } = this.state
    const { navigation } = this.props
    if (content.trim() && !_id) {
      Alert.alert(
        '',
        '如果离开，当前内容会丢失，' + (this.state.type_id === 'diary' ? '是否保存' : '是否记录到心语?'),
        [
          {text: this.state.type_id === 'diary' ? '保存' : '记录', onPress: this.saveToDiary},
          {text: '否', onPress: () => navigation.goBack(), style: 'cancel'},
        ],
        { cancelable: false }
      )
    } else {
      navigation.goBack()
    }
  }

  render() {
    const { loading, type_id, content, spinner, spinnerText } = this.state
    const curType = MIND_TYPES[type_id]
    const { icon, name, action, description } = curType
    return (
        !loading ? (<View 
          style={{
            flex: 1,
            backgroundColor: '#fff'
          }}
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
          <Back 
            goBack={this.closeEditor} 
            mode="close"
            centerCom={(<TouchableOpacity
              onPress={() => this._modal.open('TypeSelect', {
                type_id
              })}
              style={{
                padding: 10,
                flexDirection: 'row',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              <Text style={{ 
                fontSize: 16,
                color: '#666'
              }}>{icon + ' ' + name}</Text>
              <TYicon 
                style={{
                  transform: [{ rotate: '-90deg'}],
                  marginLeft: 10,
                }}
                ref={ref => this._buttonText = ref} 
                name='fanhui' 
                size={16} 
              color='#666'></TYicon>
            </TouchableOpacity>)}
            rightButton={{
              name: action,
              btnDis: !content.trim(),
              onPress: () => this.postMind()
            }}
          />
            <KeyboardAvoidingView
              keyboardVerticalOffset={Platform.select({ios: STATUS_BAR_HEIGHT, android: null})}
              behavior={Platform.select({ios: 'padding', android: null})}
              style={{flex: 1}}
              onStartShouldSetResponderCapture={(e) => {
                let target = e.nativeEvent.target
                if (target !== findNodeHandle(this._input)
                  && (target !== findNodeHandle(this._button))
                  && (target !== findNodeHandle(this._buttonText))) {
                    this._input && this._input.blur();
                }
              }}
            >
              <TextInput
                onChangeText={(content) => {
                  this.setState({content})
                }}
                autoFocus={true}
                value={this.state.content}
                ref={ref => {
                  this._input = ref
                }}
                style={{
                  flex: 1,
                  color: '#333',
                  padding: 10,
                  marginTop: 10,
                  fontSize: 16,
                  textAlignVertical: 'top',
                  lineHeight: 28
                }}
                placeholder={description}
                placeholderTextColor="#999999"
                autoCapitalize="none"
                multiline={true}
              />
          </KeyboardAvoidingView>
          <TypeModal 
            navigation={this.props.navigation}
            ref={ ref => this._modal = ref }
            onChangeType={(type_id) => this.setState({
              type_id
            })}
          />
        </View>) : (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <ActivityIndicator />
          </View>
        )
    )
  }
}
