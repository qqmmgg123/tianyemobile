
import { AsyncStorage, Alert } from 'react-native'
import NavigatorService from 'app/services/navigator'
import { store } from 'app/Store'
import { changeLoginState } from 'app/HomeActions'

function alert(msg) {
  Alert.alert(
    null,
    msg,
    [
      {text: '确定'},
    ],
    { cancelable: true }
  )
}

// 正式服地址
export const rootUrl = 'http://192.168.1.3'

// 测试服地址
// export const rootUrl = 'http://192.168.1.3:3000'

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
  const FETCH_TIMEOUT = 5000;
  let didTimeOut = false;
  
  return new Promise(function(resolve, reject) {
    const timeout = setTimeout(function() {
      didTimeOut = true;
      reject(new Error('Request timed out'));
    }, FETCH_TIMEOUT)

    fetch([rootUrl, api].join('/'), {
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
            setTimeout( () => {
              alert(res.info || res.message || '异常错误')
            }, 0)
            break
        }
      } else {
        let { user } = res
        let userInfo = getUserInfo()
        if (user && (!userInfo || user._id !== userInfo._id)) {
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
      clearTimeout(timeout);
      resolve(res)
    }).catch(function(err) {
      setTimeout( () => {
        alert(err.message || '异常错误')
      }, 0)
      if(didTimeOut) return;
      reject(err);
    })
  })
}
