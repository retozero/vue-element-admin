import request from '@/utils/request'

export function list(data) {
  return request({
    url: '/api2/third/config', // 相对路径
    method: 'get',
    headers: {

    },
    params: {
      'page': data.page,
      'size': data.size
    }
  })
}
