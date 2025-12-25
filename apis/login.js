import request from '../utils/request'

export function loginApi (data) {
  return request.post('/login', data)
}

export function getUserInfo() {
  return request.get('/getUserInfo')
}

export function updateUserInfo(data) {
  return request.post('/updateUserInfo', data)
}

export function encrypt(data) {
  return request.post('/encrypt', data)
}

export function getPhone(code) {
  return request.get(`/getPhone?code=${code}`)
}

export function checkToken(data) {
  return request.post(`/checkToken`, data)
}

export function configValues() {
  return request.get('/config/values')
}

export function startBanner() {
  return request.get('/startBanner')
}