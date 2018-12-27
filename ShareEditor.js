import React from 'react'
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native'
import { createMaterialTopTabNavigator } from 'react-navigation'
import { get, post, put } from './request'
import { toast } from './Toast'
import TYicon from './TYicon'
import Back from './component/Back'

const Permission = (props) => {
  return (
    <View
      style={{
        borderRadius: 3,
        backgroundColor: '#f2f2f2',
        borderColor: '#e6e6e6',
        borderStyle: 'solid',
        borderWidth: 1,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
      }}
    >
      <Text style={{
        color: '#adadad',
        fontSize: 12,
        marginRight: 10
      }}>所有人可见</Text>
      <TYicon name='jiesuo' size={16} color='#b8b8b8'></TYicon>
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

  componentWillReceiveProps(nextProps) {
    let { screenProps } = nextProps
    let share = screenProps.share
    if (screenProps 
        && share 
        && share._id !== this.state._id) {
      this.setState({
        _id: share._id,
        // column_id: share.column_id,
        content: share.content
      })
    }
  }

  static navigationOptions = {
    title: '鸡汤句子'
  };

  async postShare() {
    const { _id, column_id, content } = this.state
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
    return (
      <View
        style={{
          flex: 1,
          height: '100%',
          paddingTop: 3,
          paddingHorizontal: 7,
          paddingBottom: 100
        }}
      >
        <TextInput
          onChangeText={(content) => this.setState({content})}
          autoFocus={true}
          value={this.state.content}
          style={{
            flex: 1,
            borderColor: '#cccccc', 
            borderWidth: 1,
            paddingTop: 3,
            paddingHorizontal: 7,
            paddingBottom: 4,
            borderRadius: 3,
            marginTop: 10,
            minHeight: 80
          }}
          placeholder="内容"
          placeholderTextColor="#cccccc"
          autoCapitalize="none"
          multiline={true}
        />
        <Permission />
        <TouchableOpacity
          style={{
            borderColor: '#dddddd', 
            borderWidth: 1, 
            borderRadius: 3,
            justifyContent: 'center',
            height: 36,
            paddingTop: 3,
            paddingHorizontal: 7,
            paddingBottom: 4,
            marginTop: 10
          }}
          onPress={this.postShare.bind(this)}
        >
          <Text style={{
            alignItems: 'center', 
            color: '#666666', 
            textAlign: 'center'
          }}>{this.state._id ? '更新' : '分享'}</Text>
        </TouchableOpacity>
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

  componentWillReceiveProps(nextProps) {
    let { screenProps } = nextProps
    let share = screenProps.share
    if (screenProps 
        && share 
        && share._id !== this.state._id) {
      this.setState({
        _id: share._id,
        // column_id: share.column_id,
        title: share.title,
        content: share.content
      })
    }
  }

  static navigationOptions = {
    title: '散文诗歌'
  };

  async postShare() {
    const { _id, column_id, title, content } = this.state
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
        lres = await post('share', {
          column_id,
          title,
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
    return (
      <View
        style={{
          flex: 1,
          paddingTop: 3,
          paddingHorizontal: 7,
          paddingBottom: 100
        }}
      >
        <TextInput
          onChangeText={(title) => this.setState({title})}
          value={this.state.title}
          style={{
            borderColor: '#cccccc', 
            borderWidth: 1,
            height: 36,
            paddingTop: 3,
            paddingHorizontal: 7,
            paddingBottom: 4,
            borderRadius: 3,
            marginTop: 10
          }}
          placeholder="标题"
          placeholderTextColor="#cccccc"
          allowFontScaling={false}
          autoCapitalize="none"
        />
        <TextInput
          onChangeText={(content) => this.setState({content})}
          value={this.state.content}
          style={{
            flex: 1,
            borderColor: '#cccccc', 
            borderWidth: 1,
            paddingTop: 3,
            paddingHorizontal: 7,
            paddingBottom: 4,
            borderRadius: 3,
            marginTop: 10,
            minHeight: 80
          }}
          placeholder="内容"
          placeholderTextColor="#cccccc"
          autoCapitalize="none"
          multiline={true}
        />
        <Permission />
        <TouchableOpacity
          style={{
            borderColor: '#dddddd', 
            borderWidth: 1, 
            borderRadius: 3,
            justifyContent: 'center',
            height: 36,
            paddingTop: 3,
            paddingHorizontal: 7,
            paddingBottom: 4,
            marginTop: 10
          }}
          onPress={this.postShare.bind(this)}
        >
          <Text style={{
            alignItems: 'center', 
            color: '#666666', 
            textAlign: 'center'
          }}>{this.state._id ? '更新' : '分享'}</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

let navOptions = {
  // initialRouteName: 'LiteratureEditor',
  tabBarOptions: {
    labelStyle: {
      color: '#333333'
    },
    indicatorStyle: {
      width: 20,
      left: '25%',
      marginLeft: -10,
      backgroundColor: 'red'
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

    this.state = {
      share: null
    }
  }

  static router = ShareEditorNav.router

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
          share
        })
      }
    }
  }

  render() {
    let { share } = this.state
    return (
      <View style={{flex: 1}}>
        <Back navigation={this.props.navigation} />
        <ShareEditorNav screenProps={{
          share
        }} navigation={this.props.navigation} />
      </View>
    )
  } 
}
