import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux';
import {
  SafeAreaView,
  StyleSheet, 
  View,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native'
import { createAppContainer, createDrawerNavigator } from 'react-navigation'
import Home from './Home'
import HomeReducer from './HomeReducer';

const store = createStore(HomeReducer)

class Friend extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      query: ''
    }
  }

  static navigationOptions = {
    drawerLabel: '知己',
  };

  render() {
    return (
      <View style={{
        paddingTop: 3,
        paddingHorizontal: 7,
        paddingBottom: 4
      }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TextInput
            style={{
              borderColor: '#cccccc', 
              borderWidth: 1,
              height: 36,
              paddingTop: 3,
              paddingHorizontal: 7,
              paddingBottom: 4,
              borderRadius: 3,
              flex: 1
            }}
            placeholder="请输入对方用户名或邮箱"
            placeholderTextColor="#cccccc"
            allowFontScaling={false}
            onChangeText={(query) => this.setState({query})}
            value={this.state.query}
          />
          <TouchableOpacity
            style={{
              borderColor: '#dddddd', 
              borderWidth: 1, 
              borderRadius: 3,
              justifyContent: 'center',
              height: 36,
              paddingTop: 3,
              paddingHorizontal: 7,
              paddingBottom: 4
            }}
          >
            <Text style={{alignItems: 'center', color: '#666666'}}>查找</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

class Login extends React.Component {

  constructor(props) {
    super(props)
    this.state = { 
      username: '用户名',
      password: '密码'
    }
  }

  static navigationOptions = {
    drawerLabel: '登录'
  };

  render() {
    return (
      <View>
        <TextInput
          onChangeText={(username) => this.setState({username})}
          value={this.state.username}
          style={{
            borderColor: '#cccccc', 
            borderWidth: 1,
            height: 36,
            paddingTop: 3,
            paddingHorizontal: 7,
            paddingBottom: 4,
            borderRadius: 3,
          }}
          placeholder="用户名"
          placeholderTextColor="#cccccc"
          allowFontScaling={false}
        />
        <TextInput
          style={{
            borderColor: '#cccccc', 
            borderWidth: 1,
            height: 36,
            paddingTop: 3,
            paddingHorizontal: 7,
            paddingBottom: 4,
            borderRadius: 3,
          }}
          placeholder="请输入对方用户名或邮箱"
          placeholderTextColor="#cccccc"
          allowFontScaling={false}
          onChangeText={(password) => this.setState({password})}
          value={this.state.password}
        />
        <TouchableOpacity
          style={{
            borderColor: '#dddddd', 
            borderWidth: 1, 
            borderRadius: 3,
            justifyContent: 'center',
            height: 36,
            paddingTop: 3,
            paddingHorizontal: 7,
            paddingBottom: 4
          }}
        >
          <Text style={{alignItems: 'center', color: '#666666'}}>登录</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
});

const MyDrawerNavigator = createDrawerNavigator({
  Home: {
    screen: Home,
  },
  Friend: {
    screen: Friend,
  },
  Login: {
    screen: Login,
  },
})

const AppContainer = createAppContainer(MyDrawerNavigator)

export default class App extends React.Component {
  render() {
    return (
      <Provider store={ store }>
        <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
          <AppContainer />
        </SafeAreaView>
      </Provider>
    )
  }
}
