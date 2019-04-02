import React from 'react'
import { 
  View, 
  TouchableOpacity, 
  Text,
  Animated,
} from 'react-native'
import { del } from 'app/component/request'
import globalStyles from 'app/component/globalStyles'

const ANIMATION_DURATION = 250

export default class FriendItem extends React.Component {

  constructor(props) {
    super(props)
    this._animated = new Animated.Value(1);
  }

  async removeFriend(id) {
    let res = await del(`friend/${id}/remove`)
    if (res) {
      const { success } = res
      if (success) {
        this.onRemove()
      }
    }
  }

  friendAccept(id) {
    const { onAccpect } = this.props
    if (onAccpect) {
      onAccpect(id)
    }
  }

  friendDeny(id) {
    const { onDeny } = this.props
    if (onDeny) {
      onDeny(id, () => {
        this.onRemove()
      })
    }
  }

  friendRemarkt(id) {
    const { onRemark } = this.props
    if (onRemark) {
      onRemark(id)
    }
  }

  onRemove = () => {
    const { onRemove } = this.props
    if (onRemove) {
      Animated.timing(this._animated, {
        toValue: 0,
        duration: ANIMATION_DURATION,
      }).start(() => onRemove())
    }
  }

  render() {
    const rowStyles = [
      { opacity: this._animated }
    ]
    const { 
      status, 
      recipient_status, 
      remark, 
      recipient_name, 
      content,
      recipient_id,
      shareHelp,
      shareShare,
    } = this.props

    let state = ''
    let message = ''
    let btns = null
    if (status === 1 && recipient_status === 0) {
      state ='拒绝了你的申请...'
      message = content
      btns = (
        <View>
          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => this.removeFriend(recipient_id)}
          >
            <Text style={globalStyles.buttonText}>删除</Text>
          </TouchableOpacity>
        </View>
      )
    } else if (status === 1 && recipient_status === 2) {
      state ='等待对方验证...'
      btns = (
        <View>
          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => this.removeFriend(recipient_id)}
          >
            <Text style={globalStyles.buttonText}>取消</Text>
          </TouchableOpacity>
        </View>
      )
    } else if (status === 2 && recipient_status === 1) {
      state = '申请加您为有缘人?'
      message = content
      btns = (
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => this.friendAccept(recipient_id)}
          >
            <Text style={globalStyles.buttonText}>同意</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.button, {
              marginLeft: 10
            }]}
            onPress={() => this.friendDeny(recipient_id)}
          >
            <Text style={globalStyles.buttonText}>拒绝</Text>
          </TouchableOpacity>
        </View>
      )
    } else if (status === 3 && recipient_status === 3) {
      btns = (
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap'
        }}>
          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => this.friendRemarkt({
              recipient_id,
              remark,
              shareHelp,
              shareShare,
            })}
          >
            <Text style={globalStyles.buttonText}>编辑</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.button, {
              marginLeft: 10
            }]}
            onPress={() => this.removeFriend(recipient_id)}
          >
            <Text style={globalStyles.buttonText}>删除</Text>
          </TouchableOpacity>
        </View>
      ) 
    } else if (status === 0 && recipient_status === 0) {
        state = '将您移出了有缘人...'
        message = content
        btns = (
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            <TouchableOpacity
              style={[globalStyles.button, {
                marginLeft: 10
              }]}
              onPress={() => this.removeFriend(recipient_id)}
            >
              <Text style={globalStyles.buttonText}>删除</Text>
            </TouchableOpacity>
          </View>
        )
    }

    return (
      <Animated.View style={rowStyles}>
        <View style={{
          padding: 10,
          flexDirection: 'row',
          backgroundColor: 'white',
          alignItems: 'center'
        }}>
          <View style={{
            flex: 1
          }}>
            <TouchableOpacity
              activeOpacity={1}
            >
              <Text style={{ 
                fontSize: 16,
                color: '#333333',
                lineHeight: 24
                }}>{remark || recipient_name || ''}</Text>
            </TouchableOpacity>
            {state ? (<Text style={{ 
              fontSize: 12,
              color: '#999999',
              lineHeight: 24
            }}>
              {state}
            </Text>) : null}
            {message ? (<Text style={{ 
              fontSize: 14,
              color: '#666666',
              lineHeight: 24
            }}>
              {message}
            </Text>) : null}
          </View>
          {btns}
        </View>
      </Animated.View>
    )
  }
}
