import React from 'react'
import {
  Modal
} from 'react-native'

export function createFriendModal(Inner, options) {

  return class FriendModal extends React.Component {

      constructor(props) {
        super(props)
        this.state = {
          aniType: 'fade',
          modalVisible: false,
          params: {},
          curCom: Object.values(Inner)[0]
        }
      }

      setParams(params) {
        this.setState({
          params: Object.assign(this.state.params, params)
        })
      }

      open(name, params) {
        let newState = {
          modalVisible: true
        }
        if (name) {
          newState.curCom = Inner[name]['com'] || Inner[name]
          newState.aniType = Inner[name]['animationType'] || 'fade'
          params && this.setParams(params)
        }
        this.setState(newState)
      }

      close() {
        this.setModalVisible(false)
      }

      setModalVisible(visible) {
        this.setState({
          modalVisible: visible
        })
      }

      render() {
        const InnerCom = this.state.curCom

        return (
          <Modal
            visible={this.state.modalVisible}
            onBackButtonPress={() => this.close()}
            onRequestClose={() => this.close()}
            {...(this.state.aniType === 'fade' ? {
              animationType: 'fade', 
              transparent: true,
            } : (this.state.aniType === 'slide' ? {
              animationType: 'slide', 
              transparent: false,
            } : {}))}
          >
            <InnerCom 
              {...this.props}
              ref={ref => this._innerCom = ref}
              modal={{
                close: () => this.close(),
                open: () => this.open(),
                getParam: (key) => this.state.params[key]
              }}
            />
          </Modal>
        )
      }

    }
}