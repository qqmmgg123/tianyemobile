import { AsyncStorage, Alert } from 'react-native'
import NavigatorService from 'app/services/navigator'
import { store } from 'app/Store'
import { layoutHomeData, changeLoginState } from 'app/HomeActions'
import CookieManager from 'react-native-cookies'

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
export const rootUrl = 'https://www.tianyeapp.top'

// 测试服地址
// export const rootUrl = 'http://192.168.1.7:3000'

// 当前访问地址
let curRoute = ''
// 缓存用户信息
, userInfo = ''
// 缓存cookie
, cookie = ''

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

export function setCookieByMemory(value) {
  cookie = value
}

export function setUserByMemory(value) {
  userInfo = value
}

export function getCookieByMemory() {
  if (cookie) return cookie
  else return ''
}

export function getUserByMemory() {
  if (userInfo) return JSON.parse(userInfo)
  else return null
}

export function removeCookieByMemory() {
  cookie = ''
}

export function removeUserByMemory() {
  userInfo = ''
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
  const REQUEST_TIMEOUT = 12000
  
  return new Promise(function(resolve, reject) {
    const memoryCookie = getCookieByMemory()
    , timeout = setTimeout(function() {
      setTimeout(() => {
        alert(api + ', 请求超时，请检查你的网络。')
      }, 0)
      clearTimeout(timeout)
      reject(new Error('Request timed out'));
    }, REQUEST_TIMEOUT)
    CookieManager.clearAll().then(() => {
      console.log(`当前请求:${api}，发送...`, memoryCookie)
      fetch([rootUrl, api].join('/'), {
        method, // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        headers: Object.assign({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Cookie': memoryCookie
        }, headers),
        credentials: "omit", // omit, same-origi, include
        redirect: "manual", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify(data), // body data type must match "Content-Type" header
      }).then(function(response) {
        let resCookie = response.headers.get('set-cookie')
        let newCookie = resCookie ? resCookie.match(/(koa:sess[^;]+;)/g).join(' ') : ''
        console.log(`当前请求:${api}，成功返回数据...`, newCookie, resCookie)
        if (newCookie) {
          setCookieByMemory(newCookie)
          AsyncStorage.setItem('cookie', newCookie)
        }
        return response.json()
      }).then(res => {
        let errMsg = ''
        if (!res.success) {
          switch (res.code) {
            case 1002:
              removeCookieByMemory()
              removeUserByMemory()
              AsyncStorage.multiRemove(['cookie', 'user'])
              store.dispatch(changeLoginState({
                need_login: true,
                userId: '',
                userId: '',
                nickname: '',
                email: ''
              }))
              NavigatorService.navigate('Login')
              errMsg = res.info || res.message || '异常错误'
              clearTimeout(timeout)
              throw new Error(errMsg)
            default:
              errMsg = res.info || res.message || '异常错误'
              clearTimeout(timeout)
              throw new Error(errMsg)
          }
        } else {
          let { user, notification } = res
          if (user && notification) {
            console.log(`用户变更: ${user.nickname}`)
            // 获取该用户通知
            // TODO: 获取用户消息，应该在服务器进行。reducer也应该是用户的登陆信息
            setUserByMemory(JSON.stringify(user))
            AsyncStorage.setItem('user', JSON.stringify(user))
            store.dispatch(layoutHomeData({ 
              message: notification
            }))
            store.dispatch(changeLoginState({
              need_login: false,
              userId: user._id,
              nickname: user.nickname,
              email: user.email
            }))
            console.log(`用户变更结束: ${user.nickname}`)
            clearTimeout(timeout)
            resolve(res)
            return
          }
          clearTimeout(timeout)
          resolve(res)
        }
      }).catch((err) => {
        setTimeout(() => {
          alert(err.message || '异常错误')
        }, 0)
        clearTimeout(timeout)
        reject(err)
      })
    })
  })
}
