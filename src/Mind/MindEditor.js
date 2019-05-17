/**
 * 心事编辑界面
 */
import React from 'react'
import {
  View,
  KeyboardAvoidingView,
  TextInput,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  Dimensions
} from 'react-native'
import { Spinner } from 'app/component/GlobalModal'
import { get, post, put } from 'app/component/request'
import { MIND_TYPES, STATUS_BAR_HEIGHT, BASE_COLOR } from 'app/component/Const'
import { createFriendModal } from 'app/component/GlobalModal'
import { QuoteItem } from 'app/component/Quote'
import { PERM_TYPES } from '../component/Const'
import globalStyles from 'app/component/globalStyles'
import TYicon from 'app/component/TYicon'
import Back from 'app/component/Back'
import TypeSelect from 'app/Mind/TypeSelect'
import PermSelect from 'app/Mind/PermSelect'

const { width } = Dimensions.get('window')
, TypeModal = createFriendModal({ 
  TypeSelect,
  PermSelect
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
      title: '',
      content: '',
      quote: null,
      perm_id: 'all',
      needTitle: false
    }
  }

  async postMind() {
    let { navigation } = this.props
    , { 
      _id, 
      type_id, 
      title,
      content, 
      column_id,
      perm_id
    } = this.state
    if (type_id === 'diary') {
      perm_id = 'me'
    } 
    this.setState({
      spinner: true,
      spinnerText: '',
    })
    try {
      if (_id) {
        await put(`mind/${_id}`, {
          _id: '',
          type_id,
          title,
          column_id,
          content,
          perm_id
        })
      } else {
        await post('mind', {
          _id: '',
          type_id,
          title,
          column_id,
          content,
          perm_id
        })
      }
      this.setState({
        spinner: false,
        spinnerText: '',
      }, () => {
        navigation.goBack()
        if (_id) {
          navigation.state.params.onListReload()
        } else {
          navigation.state.params.onListRefresh()
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
          let { mind } = data
          const { 
            title = '', 
            content = '',
            type_id = 'diary', 
            quote, 
            perm_id 
          } = mind
          this.setState({
            type_id,
            _id,
            title,
            needTitle: !!title,
            content,
            quote,
            perm_id
          })
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

  titleInput = el => this._titleInput = el

  handleSelectionChange = ({ nativeEvent: { selection } }) => this.setState({ selection })

  get downArraw() {
    return (
      <TYicon 
        style={{
          transform: [{ rotate: '-90deg'}],
          marginLeft: 10,
        }}
        name='fanhui' 
        size={16} 
        color='#666'>
      </TYicon>
    )
  }

  render() {
    const {
      _id,
      loading, 
      type_id, 
      perm_id,
      title,
      content, 
      quote,
      spinner, 
      spinnerText,
      needTitle
    } = this.state
    , { navigation } = this.props
    , curType = type_id && MIND_TYPES[type_id]
    , { icon, name, action, description } = curType
    , curPerm = perm_id && PERM_TYPES[perm_id]
    , curPermTips = curType && curType.permission || ''
    , curPermName = curPerm && curPerm.name || ''
    , permSelectText = curPermTips && curPermName ? curPermTips.replace(/\{name\}/, curPermName) : ''
    , needShowPerm = ['share', 'help'].indexOf(type_id) !== -1 && permSelectText
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
              {this.downArraw}
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
            >
              <ScrollView 
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={{
                  backgroundColor: '#fff',
                  padding: 10,
                }}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
              {
                needTitle
                  ? 
                  <TextInput
                    ref={this.titleInput}
                    onChangeText={value => {
                      this.setState({title: value.trim().replace(/\n|\r|\t/gi, '')})
                    }}
                    value={title}
                    style={{
                      color: '#333',
                      fontSize: 20,
                      textAlignVertical: 'top',
                      lineHeight: 32,
                    }}
                    placeholder='标题...'
                    placeholderTextColor="#999999"
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                    returnKeyType='done'
                    contextMenuHidden={false}
                    blurOnSubmit={true}
                    multiline={true}
                  />
                  : null
              }
              <TextInput
                onChangeText={(value) => {
                  this.setState({content: value})
                }}
                value={content}
                //autoFocus={true}
                style={{
                  flex: 1,
                  color: '#333',
                  fontSize: 16,
                  textAlignVertical: 'top',
                  lineHeight: 28,
                }}
                placeholder={description}
                placeholderTextColor="#999999"
                underlineColorAndroid="transparent"
                contextMenuHidden={false}
                autoCapitalize="none"
                multiline={true}
              />
              <QuoteItem 
                quote={quote}
                navigation={navigation}
              />
            </ScrollView>
            <View
              style={{
                padding: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                //position: 'absolute',
                backgroundColor: BASE_COLOR.BACKGROUND,
                width,
                //bottom: 0
              }}
            >
              {
                needShowPerm 
                  ? 
                    <TouchableOpacity
                      onPress={() => this._modal.open('PermSelect', {
                        perm_id
                      })}
                      style={{
                        paddingVertical: 10,
                        flexDirection: 'row'
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#666666'
                        }}
                      >{permSelectText}</Text>
                      {this.downArraw}
                    </TouchableOpacity>
                  : 
                    null
              }
              <TouchableOpacity
                onPress={() => {
                  this.setState({
                    needTitle: !needTitle,
                    title: ''
                  }, () => {
                    this._titleInput && this._titleInput.focus()
                  })
                }}
                style={{
                  padding: 15,
                  flexDirection: 'row'
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: '#666666'
                  }}
                >{!needTitle ? '+ 添加标题' : '- 取消标题'}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
          <TypeModal 
            navigation={this.props.navigation}
            ref={ ref => this._modal = ref }
            onChangeType={(type_id) => this.setState({
              perm_id: 'all',
              type_id
            })}
            onChangePerm={(perm_id) => this.setState({
              perm_id
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
