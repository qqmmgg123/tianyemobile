import { 
  get, 
  getUserByMemory
} from 'app/component/request'

// 获取消息
export async function getNotification() {
  const userInfo = getUserByMemory()
  if (userInfo) {
    console.log('用户信息存在, 请求用户消息......')
    let data = await get('notification')
    console.log('请求用户消息结束......')
    if (data) {
      let { success, notification } = data
      if (success) {
        console.log('成功获得用户消息......', notification)
        return notification
      }
    }
  }
  return []
}