import React from 'react'
import { 
  View, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Text, 
  TextInput,
  Platform,
  ScrollView,
} from 'react-native'
import { post } from 'app/component/request'
import globalStyles from 'app/component/globalStyles'
import Back from 'app/component/Back'
import { toast } from 'app/Toast'
import { MIND_TYPES, STATUS_BAR_HEIGHT } from 'app/component/Const'


export default class QuoteEditor extends React.Component {

  constructor(props) {
    super(props)
    const { navigation } = props
    this.state = {
      content: '',
      type: navigation.getParam('type'),
      help: navigation.getParam('help'),
      classic: navigation.getParam('classic'),
    }
  }

  async replyConfirm() {
    let { content, help, classic } = this.state
    let replyId = help._id
    let ref_id = classic._id
    let res = await post(`mind/${replyId}/reply`, { 
      content,
      parent_id: replyId,
      parent_type: 'mind',
      ref_id
    })
    if (res) {
      let { success } = res
      if (success) {
        this.props.navigation.goBack()
        toast('已送出。')
      }
    }
  }

  async mindConfirm() {
    let { type, content, classic } = this.state
    let ref_id = classic._id
    let res = await post(`mind`, { 
      content, ref_id, type_id: type, column_id: 'sentence',
    })
    if (res) {
      let { success } = res
      if (success) {
        this.props.navigation.goBack()
        toast('已' +  ((MIND_TYPES[type] && MIND_TYPES[type].action)))
      }
    }
  }

  render() {
    let { type, help, classic, content } = this.state
    return (
      <View
        style={globalStyles.container} 
      >
        <Back 
          navigation={this.props.navigation} 
          centerCom={(<View
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
            }}>{MIND_TYPES[type] && (MIND_TYPES[type].icon + MIND_TYPES[type].name) || "回复"}</Text>
          </View>)}
          rightButton={{
            name: MIND_TYPES[type] && MIND_TYPES[type].action || "送出",
            btnDis: !content.trim(),
            onPress: type === 'reply' 
              ? () => this.replyConfirm()
              : () => this.mindConfirm()
          }}
        />
        <KeyboardAvoidingView
          keyboardVerticalOffset={Platform.select({ios: STATUS_BAR_HEIGHT, android: null})}
          behavior={Platform.select({ios: 'padding', android: null})}
          style={{ flex: 1 }}
        >
          <ScrollView 
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{
              backgroundColor: '#fff',
              padding: 20,
            }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {help && help.content ? <Text
              style={{
                fontSize: 16,
                color: '#333',
                lineHeight: 24,
              }}
              numberOfLines={1}
            >
              {help.content}
            </Text> : null}
            <View style={{
              flexDirection: 'row', 
              alignItems: 'center',
              marginTop: 10,
            }}>
              <TextInput
                style={{
                  height: 100,
                  color: '#333',
                  paddingVertical: 10,  
                  fontSize: 16,
                  textAlignVertical: 'top',
                  lineHeight: 28,
                  flex: 1
                }}
                placeholder={MIND_TYPES[type] && MIND_TYPES[type].description || "回复内容..."}
                placeholderTextColor="#cccccc"
                allowFontScaling={false}
                autoCapitalize="none"
                onChangeText={(content) => this.setState({content})}
                value={this.state.content}
                multiline={true}
                autoFocus={true}
              />
            </View>
            <TouchableOpacity
              style={[globalStyles.quoteBg, {
                marginTop: 10
              }]}
              onPress={() => this.props.navigation.navigate('ClassicDetail', {
                itemId: classic._id
              })}
            >
              <Text
                style={globalStyles.quoteTitle}
              >
                {classic.title}
              </Text>
              <Text
                style={globalStyles.quoteSummary}
              >
                {classic.summary}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    )
  }
}
