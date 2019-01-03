
import { AsyncStorage } from 'react-native'
import NavigatorService from './services/navigator'
import { store } from './Store'
import { changeLoginState } from './HomeActions'
import { toast } from './Toast'

export const rootUrl = 'http://192.168.1.6:8080'
// export const rootUrl = 'http://192.168.0.101:8080'
let userInfo = null
let curRoute = ''

export function get(api, data) {
  let queryStr = Object.keys(data || {})
  .map(key => key + '=' + data[key])
  .join('&');
  return request([api, queryStr].join('?'), 'GET')
}

export function post(api, data) {
  return request(api, 'POST', data)
}

export function put(api, data) {
  return request(api, 'PUT', data)
}

export function del(api, data) {
  return request(api, 'DELETE', data)
}

async function getUser() {
  try {
    const user = await AsyncStorage.getItem('user', user)
    return JSON.parse(user)
  } catch (error) {
    return null
  }
}

export function getUserInfo() {
  try {
    return JSON.parse(userInfo)
  } catch {
    return null
  }
}

async function _saveUser(user) {
  userInfo = JSON.stringify(user)
  try {
    const existUser = await getUser()
    if (!existUser) {
      await AsyncStorage.setItem('user', JSON.stringify(user))
    }
  } catch (error) {
    // Error saving data
  }
}

export async function updateUser(user) {
  userInfo = JSON.stringify(user)
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user))
  } catch (error) {
    // Error saving data
  }
}

export async function removeUser() {
  userInfo = ''
  try {
    await AsyncStorage.removeItem('user')
  } catch (error) {
    // Error saving data
  }
}

export function setCurRoute(route) {
  curRoute = route
}

export function getCurRoute() {
  return curRoute
}

export function removeCurRoute() {
  curRoute = ''
}

function request(api, method, data, headers = {}) {
  return fetch([rootUrl, api].join('/'), {
    method, // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, cors, *same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    headers: Object.assign({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }, headers),
    credentials: "same-origin",
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // no-referrer, *client
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  }).then(function(response) {
    return response.json()
  }).then(function(res) {
    if (!res.success) {
      switch (res.code) {
        case 1002:
          NavigatorService.navigate('Login')
          store.dispatch(changeLoginState({
            need_login: true,
            userId: '',
            userId: '',
            username: '',
            panname: '',
            email: ''
          }))
          removeUser()
          break
        default:
          toast(res.info || res.message || '异常错误')
          break
      }
    } else {
      let { user } = res
      if (user && !userInfo) {
        store.dispatch(changeLoginState({
          need_login: false,
          userId: user._id,
          username: user.username,
          panname: user.panname,
          email: user.email
        }))
        _saveUser(user)
      }
    }
    return res
  })
}