import React from 'react'
import { connect } from 'react-redux'
import { 
  View, 
  findNodeHandle, 
  TouchableOpacity, 
  Text, 
  TextInput, 
  KeyboardAvoidingView, 
  ActivityIndicator, 
  Picker,
} from 'react-native'
import { NavigationEvents } from 'react-navigation'
import TYicon from 'app/component/TYicon'
import { get, post, put } from 'app/component/request'
import { toast } from 'app/Toast'
import globalStyles from 'app/component/globalStyles'
import { getDate } from 'app/utils'

class DiaryEditor extends React.Component {

  constructor(props) {
    super(props)
    this.state = { 
      spinner: false,
      mode: 'create',
      _id: null,
      content: '',
      permission: '仅自己可见'
    }
  }

  async loadCurrentDiary() {
    const { navigation } = this.props
    const diaryId = navigation.getParam('itemId')
    if (diaryId) {
      let data = await get(`diary/${diaryId}`)
      let { success, diary } = data
      if (success) {
        this.setState({
          _id: diary._id || null,
          content: diary.content || '',
          mode: 'update'
        })
      }
    }
  }

  componentWillMount() {
    this.loadLatestDiary()
  }

  postDiary = async () => {
    const { mode, _id, content } = this.state

    if (!content.trim()) {
      toast('您没有输入内容。');
    }

    this.setState({
      spinner: true
    })
    try {
      let res = null
      let info = ''
      switch(mode) {
        case 'update':
          res = await put(`diary/${_id}`, {
            content
          })
          info = '已更新。'
          break
        case 'create':
          res = await post('diary', {
            content
          })
          info = '已保存。'
          break
        default:
          break
      }

      if (res.success) {
        this._input.blur()
        this.setState({
          spinner: false,
          latestDiary: res.diary
        })
        toast(info)
      } else {
        const { info } = res
        toast(info)
      }
    } catch (err) {
      toast(err.message)
    }
  }

  render() {
    const { spinner, mode } = this.state

    return (
      <KeyboardAvoidingView
        keyboardVerticalOffset={20}
        style={{
          flex: 1
        }}
        behavior='padding'
      >
        <NavigationEvents
          onWillFocus={payload => {
            this.loadCurrentDiary()
          }}
        />
        <View
          style={styles.container}
          onStartShouldSetResponderCapture={(e) => {
            let target = e.nativeEvent.target
            if (target !== findNodeHandle(this._input)
              && (target !== findNodeHandle(this._button))
              && (target !== findNodeHandle(this._buttonText))) {
                this._input && this._input.blur();
            }
          }}
        > 
          <View style={styles.header}>
            <Text style={[styles.logo, {
              textAlign: 'left',
              flex: 1
            }]}>{ title }</Text>
            <TouchableOpacity
              onPress={() => this.setState({
                content: '',
                mode: 'create'
              })}
              style={{
                padding: 10
              }}
            >
              <TYicon 
                style={{
                  marginRight: 10
                }}
                name='tianjia' 
                size={24} 
                color='#666'></TYicon>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={this.state.content.trim() ? 0.6 : 1}
              style={[globalStyles.button, !this.state.content.trim() ? globalStyles.buttonDis : null, {
                marginVertical: 5,
                marginHorizontal: 10
              }]}
              onPress={this.state.content.trim() ? this.postDiary : null}
            >
              <Text style={[globalStyles.buttonText, !this.state.content.trim() ? globalStyles.buttonDisText : null]}>
                {mode === 'update' ? '更新' : '保存'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={globalStyles.headerBottomLine}></View>
          {latestDiary ? (<TouchableOpacity
            ref={ref => this._button = ref}
            style={{
              padding: 10,
              flexDirection: 'row',
              alignItems: 'center'
            }}
            onPress={() => this.props.navigation.navigate('DiaryList')}
          >
            <TYicon 
              style={{
                marginRight: 10
              }}
              ref={ref => this._buttonText = ref} 
              name='beizhuyitianxie' 
              size={24} 
              color='#666'></TYicon>
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                color: '#666',
                fontSize: 14
              }}
            >{latestDiary.content}</Text>
            <Text
                style={{
                  marginLeft: 10,
                  color: '#999',
                  fontSize: 12
                }}
              >
                {getDate(new Date(latestDiary.updated_date)) + ' 记录'}
              </Text>
            <TYicon 
              style={{
                transform: [{ rotate: '180deg'}],
                marginBottom: 2
              }}
              ref={ref => this._buttonText = ref} 
              name='fanhui' 
              size={16} 
              color='#ccc'></TYicon>
          </TouchableOpacity>) : (spinner ? <ActivityIndicator style={{
              padding: 10,
              height: 42
            }} /> : null)}
          <View style={globalStyles.splitLine}></View>
            <View
              style={{
                flex: 1
              }}
            >
              <TextInput
                onChangeText={(content) => this.setState({content})}
                value={this.state.content}
                ref={ref => {
                  this._input = ref
                }}
                style={{
                  flex: 1,
                  color: '#333',
                  padding: 10,
                  // minHeight: 150,
                  marginTop: 10,
                  fontSize: 16,
                  textAlignVertical: 'top'
                }}
                placeholder="记录点滴心语..."
                placeholderTextColor="#999999"
                autoCapitalize="none"
                multiline={true}
              />
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
                }}>仅自己可见</Text>
                <TYicon name='suoding' size={16} color='#b8b8b8'></TYicon>
                <Picker
                  selectedValue={this.state.permission}
                  style={{ height: 50, width: 100 }}
                  onValueChange={(itemValue, itemIndex) => this.setState({permission: itemValue})}>
                  <Picker.Item label="Java" value="java" />
                  <Picker.Item label="JavaScript" value="js" />
                </Picker>
              </View>
              <View style={globalStyles.splitLine}></View>
            </View>
        </View>
      </KeyboardAvoidingView>
    )
  }
}

const mapStateToProps = (state) => {
  const { homeData } = state
  return { homeData }
}

export default connect(mapStateToProps)(DiaryEditor);
