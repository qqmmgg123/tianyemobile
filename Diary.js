import React from 'react'
import { connect } from 'react-redux'
import { View, findNodeHandle, TouchableOpacity, Text, TextInput, KeyboardAvoidingView, ScrollView, StyleSheet } from 'react-native'
import TYicon from './TYicon'
import { get, post } from './request'
import { toast } from './Toast'
import globalStyles from './globalStyles'
import { getDate } from './utils'
import Spinner from 'react-native-loading-spinner-overlay'

class DiaryEditor extends React.Component {

  constructor(props) {
    super(props)
    this.state = { 
      spinner: false,
      latestDiary: null,
      content: ''
    }
  }

  refresh() {
    this.loadLatestDiary()
  }

  async loadLatestDiary() {
    this.setState({
      spinner: true
    })
    let data = await get('diary/latest')
    if (data) {
      let { success, diary } = data
      if (success) {
        this.setState({
          spinner: false,
          latestDiary: diary
        })
      }
    }
  }

  componentWillMount() {
    this.loadLatestDiary()
  }

  async postDiary() {
    const { content } = this.state

    if (!content.trim()) {
      toast('您没有输入内容。');
    }

    this.setState({
      spinner: true
    })
    let res = await post('diary', {
      content
    })
    if (res.success) {
      this._input.blur()
      const info = '已记录。'
      this.setState({
        spinner: false,
        content: '',
        latestDiary: res.diary
      })
      toast(info)
    } else {
      const { info } = res
      toast(info)
    }
  }

  render() {
    const { features } = this.props.homeData
    const { routeName } = this.props.navigation.state
    const title = features && features[routeName.toUpperCase()] || ''
    const { latestDiary } = this.state

    return (
      <KeyboardAvoidingView
        keyboardVerticalOffset={20}
        style={{
          flex: 1
        }}
        behavior='padding'
      >
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
          <Spinner
            visible={this.state.spinner}
            color='#666'
            overlayColor='rgba(255,255,255, 0.25)'
          />
          <View style={styles.header}>
            <Text style={styles.logo}>{ title }</Text>
            {this.state.content.trim() ? <TouchableOpacity
              style={{
                justifyContent: 'center',
                paddingHorizontal: 10,
                height: 42,
              }}
              onPress={this.postDiary.bind(this)}
            >
              <Text style={{
                alignItems: 'center', 
                color: '#666666', 
                textAlign: 'center',
                color: 'rgb(112, 148, 183)'
              }}>保存</Text>
            </TouchableOpacity> : null}
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
                {getDate(new Date(latestDiary.created_date)) + ' 记录'}
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
          </TouchableOpacity>) : null}
          <View style={globalStyles.splitLine}></View>
  
            <View
              style={{
                flex: 1
              }}
              /*onScroll={() => {
                this._input.blur()
              }}*/
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
              </View>
              <View style={globalStyles.splitLine}></View>
            </View>
        </View>
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 42,
    paddingLeft: 10
  },
  logo: {
    fontSize: 16,
    textAlign: 'center',
    color: 'red'
  },
  slogan: {
    textAlign: 'center',
    color: 'orange'
  },
})

const mapStateToProps = (state) => {
  const { homeData } = state
  return { homeData }
}

export default connect(mapStateToProps)(DiaryEditor);
