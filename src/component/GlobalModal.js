import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, Modal, ActivityIndicator } from 'react-native';

export function createFriendModal(Inner, options) {

  return class FriendModal extends React.Component {

      constructor(props) {
        super(props)
        const opts = Object.values(Inner)
        const defaultOpt = opts[0]
        this.state = {
          aniType: 'fade',
          modalVisible: false,
          params: {},
          curCom: typeof defaultOpt === 'object' 
            ? (defaultOpt.com || null) 
            : (defaultOpt || null)
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

const transparent = 'transparent';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: transparent,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  background: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textContainer: {
    flex: 1,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute'
  },
  textContent: {
    top: 80,
    height: 50,
    fontSize: 20,
    fontWeight: 'bold'
  },
  activityIndicator: {
    flex: 1
  }
});

const ANIMATION = ['none', 'slide', 'fade'];
const SIZES = ['small', 'normal', 'large'];

export class Spinner extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: this.props.visible,
      textContent: this.props.textContent
    };
  }

  static propTypes = {
    cancelable: PropTypes.bool,
    color: PropTypes.string,
    animation: PropTypes.oneOf(ANIMATION),
    overlayColor: PropTypes.string,
    size: PropTypes.oneOf(SIZES),
    textContent: PropTypes.string,
    textStyle: PropTypes.object,
    visible: PropTypes.bool,
    indicatorStyle: PropTypes.object,
    customIndicator: PropTypes.element,
    children: PropTypes.element
  };

  static defaultProps = {
    visible: false,
    cancelable: false,
    textContent: '',
    animation: 'none',
    color: 'white',
    size: 'large', // 'normal',
    overlayColor: 'rgba(0, 0, 0, 0.25)'
  };

  close() {
    this.setState({ visible: false });
  }

  static getDerivedStateFromProps(props, state) {
    const newState = {};
    if (state.visible !== props.visible) newState.visible = props.visible;
    if (state.textContent !== props.textContent)
      newState.textContent = props.textContent;
    return newState;
  }

  _handleOnRequestClose() {
    if (this.props.cancelable) {
      this.close();
    }
  }

  _renderDefaultContent() {
    return (
      <View style={styles.background}>
        {this.props.customIndicator ? (
          this.props.customIndicator
        ) : (
          <ActivityIndicator
            color={this.props.color}
            size={this.props.size}
            style={[styles.activityIndicator, { ...this.props.indicatorStyle }]}
          />
        )}
        <View style={[styles.textContainer, { ...this.props.indicatorStyle }]}>
          <Text style={[styles.textContent, this.props.textStyle]}>
            {this.state.textContent}
          </Text>
        </View>
      </View>
    );
  }

  _renderSpinner() {
    if (!this.state.visible) return null;

    const spinner = (
      <View
        style={[styles.container, { backgroundColor: this.props.overlayColor }]}
        key={`spinner_${Date.now()}`}
      >
        {this.props.children
          ? this.props.children
          : this._renderDefaultContent()}
      </View>
    );

    return (
      <Modal
        animationType={this.props.animation}
        onRequestClose={() => this._handleOnRequestClose()}
        supportedOrientations={['landscape', 'portrait']}
        transparent
        visible={this.state.visible}
      >
        {spinner}
      </Modal>
    );
  }

  render() {
    return this._renderSpinner();
  }
}
