import React from 'react'
import {
  View,
  KeyboardAvoidingView,
  TextInput,
  Text,
  findNodeHandle,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-navigation'
import { get, post, put } from 'app/component/request'
import TYicon from 'app/component/TYicon'
import globalStyles from 'app/component/globalStyles'
import { createFriendModal } from 'app/component/GlobalModal'
import Back from 'app/component/Back'
import { MIND_TYPES, STATUS_BAR_HEIGHT } from 'app/component/Const'

class TypeSelect extends React.Component {

  constructor(props) {
    super(props)
    this._modal = props.modal
    const type_id = this._modal.getParam('type_id')
    this.state = {
      type_id
    }
  }

  componentDidUpdate(props, state) {
    if (state.type_id !== this.state.type_id) {
      let timer = setTimeout(() => {
        this._modal.close()
        timer = null
      }, 0)
    }
  }

  render() {
    return (
      <TouchableOpacity 
        onPressOut={() => this._modal.close()}
        activeOpacity={1}
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
          {Object.entries(MIND_TYPES).map(([id, type], index) => (<View
            key={id}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{
                padding: 15,
                flexDirection: 'row',
              }}
              onPress={() => {
                this.setState({
                  type_id: id,
                }, () => {
                  this.props.onChangeType(id)
                })
              }}>
                {this.state.type_id === id ? <TYicon 
                  style={{
                    marginRight: 10
                  }}
                  name='gou' 
                  size={16} 
                  color='#666'
                ></TYicon> : <View style={{ width: 26 }}></View>}
              <Text>{type.action + type.name + ' ' + type.icon}</Text>
            </TouchableOpacity>
            {index < Object.entries(MIND_TYPES).length - 1 ? <View style={globalStyles.splitLine}></View> : null}
          </View>))}
        </View>
      </TouchableOpacity>
    )
  }
}

const TypeModal = createFriendModal({ 
  TypeSelect,
})

export default class MindEditor extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      _id: '',
      type_id: 'diary',
      column_id: 'sentence',
      content: '',
      keyboardHeight: 0
    }
  }

  async postMind() {
    const { navigation, listRefresh, modal } = this.props
    const { _id, type_id, content, column_id } = this.state
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
    if (res) {
      const { success, info } = res
      if (success) {
        modal.close()
        if (_id) {
          navigation.navigate('MindDetail', {
            itemId: _id
          })
        }
        listRefresh && listRefresh()
      } else {
        toast(info)
      }
    }
  }

  _keyboardDidShow(e) {
    console.log(e.endCoordinates.height)
    this.setState({
      keyboardHeight: e.endCoordinates.height
    })
  }

  _keyboardDidHide() {
    this.setState({
      keyboardHeight: 0
    })
  }

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow.bind(this),
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide.bind(this),
    );
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  async componentWillMount() {
    const { modal } = this.props
    const _id = modal.getParam('itemId')
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
      const type_id = modal.getParam('itemTypeId')
      this.setState({
        loading: false,
        _id: '',
        type_id,
        column_id: 'sentence',
        content: '',
      })
    }
  }

  render() {
    const { loading, type_id, content, keyboardHeight } = this.state
    const curType = MIND_TYPES[type_id]
    const { icon, name, action, description } = curType
    return (
      <SafeAreaView
        style={{flex: 1, backgroundColor: '#f5f6f7'}} 
        forceInset={{ top: 'always', horizontal: 'never' }}
      >
        {!loading ? (<View 
          style={{
            flex: 1,
            backgroundColor: '#fff'
          }}
        >
          <Back 
            goBack={() => this.props.modal.close()} 
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
        </View>) : (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <ActivityIndicator />
          </View>
        )}
        <TypeModal 
          navigation={this.props.navigation}
          ref={ ref => this._modal = ref }
          onChangeType={(type_id) => this.setState({
            type_id
          })}
        />
      </SafeAreaView>
    )
  }
}
