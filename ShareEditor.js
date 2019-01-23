import React from 'react'
import {
  KeyboardAvoidingView,
  View,
  TextInput,
  Text,
} from 'react-native'
import { createMaterialTopTabNavigator } from 'react-navigation'
import { get, post, put } from './request'
import { toast } from './Toast'
import TYicon from './TYicon'
import Back from './component/Back'
import globalStyles from './globalStyles'
import { NavigationEvents } from "react-navigation"

const Permission = (props) => {
  return (
    <View>
      <View style={globalStyles.splitLine}></View>
        <View
          style={{
            paddingVertical: 10,
            height: 42,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{
            color: '#adadad',
            fontSize: 12,
            marginRight: 10
          }}>所有人可见</Text>
          <TYicon name='jiesuo' size={16} color='#b8b8b8'></TYicon>
        </View>
      <View style={globalStyles.splitLine}></View>
    </View>
  )
}

class SentenceEditor extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      _id: '',
      column_id: 'sentence',
      content: ''
    }
  }

  componentDidMount() {
    let { screenProps } = this.props
    let { onCompInit } = screenProps
    onCompInit('SentenceEditor', this)
  }

  componentWillReceiveProps(nextProps) {
    let { screenProps } = nextProps
    let share = screenProps.share
    if (screenProps 
        && share 
        && share._id !== this.state._id) {
      this.setState({
        _id: share._id,
        // column_id: share.column_id,
        content: share.content || ''
      })
    }
  }

  static navigationOptions = {
    title: '句子'
  };

  async postShare() {
    const { _id, column_id, content = '' } = this.state
    if (!content.trim()) {
      toast('抱歉，您输入的是空内容。')
      return
    }

    try {
      let res = null
      if (_id) {
        res = await put(`share/${_id}`, {
          column_id,
          content
        })
      } else {
        res = await post('share', {
          column_id,
          content
        })
      }
      if (res) {
        const { success } = res
        if (success) {
          this.props.navigation.navigate('Share')
          this.props.navigation.state.params.onGoBack();
        } else {
          const { info } = res
          toast(info)
        }
      }
    } catch (err) {
      toast(err.message)
    }
  }

  render() {
    let { screenProps } = this.props
    let { onInputChange, onScreenChange } = screenProps

    return (
      <View
        style={{
          flex: 1
        }}
      >
        <NavigationEvents
          onWillFocus={payload => {
            onScreenChange('SentenceEditor', !this.state.content.trim())
          }}
        />
        <TextInput
          onChangeText={(content) => {
            this.setState({content}, () => {
              onInputChange(!this.state.content.trim())
            })
          }}
          autoFocus={true}
          value={this.state.content}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 3,
            marginTop: 10,
            minHeight: 80,
            color: '#333333',
            fontSize: 16,
            lineHeight: 28
          }}
          placeholder="内容"
          placeholderTextColor="#999"
          autoCapitalize="none"
          multiline={true}
        />
        <Permission />
      </View>
    )
  }
}

class LiteratureEditor extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      _id: '',
      column_id: 'literature',
      title: '',
      content: ''
    }
  }

  componentDidMount() {
    let { screenProps } = this.props
    let { onCompInit } = screenProps
    onCompInit('LiteratureEditor', this)
  }

  componentWillReceiveProps(nextProps) {
    let { screenProps } = nextProps
    let share = screenProps.share
    if (screenProps 
        && share 
        && share._id !== this.state._id) {
      this.setState({
        _id: share._id,
        // column_id: share.column_id,
        title: share.title || '',
        content: share.content || ''
      })
    }
  }

  static navigationOptions = {
    title: '文章'
  };

  async postShare() {
    const { _id, column_id, title = '', content = '' } = this.state
    if (!title.trim()) {
      toast('抱歉，您没有输入标题。')
      return
    }

    if (!content.trim()) {
      toast('抱歉，您没有输入正文内容。')
      return
    }

    try {
      let res = null
      if (_id) {
        res = await put(`share/${_id}`, {
          column_id,
          title,
          content
        })
      } else {
        res = await post('share', {
          column_id,
          title,
          content
        })
      }
      if (res) {
        const { success } = res
        if (success) {
          if (_id) {
            this.props.navigation.navigate('ShareDetail', {
              itemId: _id
            })
          } else {
            this.props.navigation.navigate('Share')
          }
          this.props.navigation.state.params.onGoBack();
        } else {
          const { info } = res
          toast(info)
        }
      }
    } catch (err) {
      toast(err.message)
    }
  }

  render() {
    let { screenProps } = this.props
    let { onInputChange, onScreenChange } = screenProps

    return (
      <View
        style={{
          flex: 1
        }}
      >
        <NavigationEvents
          onWillFocus={payload => {
            console.log(this.state.title, this.state.content)
            onScreenChange('LiteratureEditor', !this.state.title.trim() || !this.state.content.trim())
          }}
        />
        <TextInput
          onChangeText={(title) => {
            this.setState({title}, () => {
              onInputChange(!this.state.title.trim() || !this.state.content.trim())
            })
          }}
          value={this.state.title}
          style={{
            paddingVertical: 15,
            paddingHorizontal: 10,
            borderRadius: 3,
            fontSize: 20,
            // textAlign: 'center',
          }}
          placeholder="标题"
          placeholderTextColor="#999"
          // allowFontScaling={false}
          autoCapitalize="none"
        />
        <View style={globalStyles.splitLine}></View>
        <TextInput
          onChangeText={(content) => {
            this.setState({content}, () => {
              onInputChange(!this.state.title.trim() || !this.state.content.trim())
            })
          }}
          value={this.state.content}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 3,
            marginTop: 10,
            minHeight: 80,
            color: '#333333',
            fontSize: 16,
            lineHeight: 28
          }}
          placeholder="内容"
          placeholderTextColor="#999"
          autoCapitalize="none"
          multiline={true}
        />
        <Permission />
      </View>
    )
  }
}

let navOptions = {
  tabBarOptions: {
    labelStyle: {
      color: '#333333'
    },
    indicatorStyle: {
      width: 20,
      left: '25%',
      marginLeft: -10,
      backgroundColor: '#FF0140'
    },
    style: {
      backgroundColor: '#ffffff',
    }
  }
}

const ShareEditorNav = createMaterialTopTabNavigator({
  SentenceEditor,
  LiteratureEditor
}, navOptions)

export default class ShareEditor extends React.Component {

  constructor(props) {
    super(props)
    this.navs = {}
    this.state = {
      share: null,
      currentScreen: 'SentenceEditor'
    }
  }

  static router = ShareEditorNav.router

  static navigationOptions = {
    cardStack: {
      gesturesEnabled: false
    }
  }

  async componentWillMount() {
    const { navigation } = this.props

    const column = navigation.getParam('itemColumn')
    if (column) {
      const screen = column.charAt(0).toUpperCase() + column.slice(1) + 'Editor'
      navigation.navigate(screen)
    }

    const shareId = navigation.getParam('itemId')
    if (shareId) {
      let data = await get(`share/${shareId}`)
      let { success, share } = data
      if (success) {
        this.setState({
          share,
          btnDis: true
        })
      }
    }
  }

  render() {
    let { share, btnDis, currentScreen } = this.state
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior='padding'
      >
        <View style={{flex: 1}}>
          <Back 
            navigation={this.props.navigation} 
            rightButton={{
              name: share && share._id ? '更新' : '分享',
              btnDis,
              onPress: () => {
                this.navs[currentScreen].postShare()
              }
            }}
          />
          <ShareEditorNav
            screenProps={{
              share,
              onInputChange: (btnDis) => this.setState({ btnDis }),
              onScreenChange: (currentScreen, btnDis) => this.setState({ currentScreen, btnDis }),
              onCompInit: (key, comp) => {
                this.navs[key] = comp
              }
            }} 
            navigation={this.props.navigation} 
          />
        </View>
      </KeyboardAvoidingView>
    )
  } 
}
