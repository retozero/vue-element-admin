import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api2/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/api2/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
