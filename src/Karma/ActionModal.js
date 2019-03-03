import React from 'react'
import { 
  View, 
  TouchableOpacity, 
  Text, 
} from 'react-native'
import globalStyles from 'app/component/globalStyles'
import { createFriendModal } from 'app/component/GlobalModal'

const actions = [
  {
    id: 'remove',
    name: '删除',
  },
]

class ActionSelect extends React.Component {

  constructor(props) {
    super(props)
    this._modal = props.modal
    this.onRemoveReply = this._modal.getParam('onRemoveReply')
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
          {actions.map((action, index) => (<View
            key={action.id}
          >
            <TouchableOpacity
              style={{
                padding: 15,
                flexDirection: 'row',
              }}
              onPress={() => {
                this.onRemoveReply()
                this._modal.close()
              }}>
              <Text>{action.name}</Text>
            </TouchableOpacity>
            {index < actions.length - 1 ? <View style={globalStyles.splitLine}></View> : null}
          </View>))}
        </View>
      </TouchableOpacity>
    )
  }
}

const ActionModal = createFriendModal({ 
  ActionSelect,
})

export default ActionModal
