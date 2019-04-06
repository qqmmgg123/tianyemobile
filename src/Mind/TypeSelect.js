import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native'
import TYicon from 'app/component/TYicon'
import globalStyles from 'app/component/globalStyles'
import { MIND_TYPES } from 'app/component/Const'

export default class TypeSelect extends React.Component {

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