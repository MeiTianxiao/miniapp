import request from '../utils/request'

export function category (data) {
  return request.get('/category', data)
}

export function goodsInfo () {
  return request.get('/shopping-cart/info')
}

export function modifyNumber (data) {
  return request.post('/shopping-cart/modifyNumber', data)
}

export function goodSelect (data) {
  return request.post('/shopping-cart/goodSelect', data)
}

export function addGoods (data) {
  return request.post('/shopping-cart/addGoods', data)
}

export function goodlist ({ page, pageSize, categoryId }) {
  return request.get(`/goodlist?page=${page}&pageSize=${pageSize}&categoryId=${categoryId}`)
}

export function delGoods (data) {
  return request.post('/shopping-cart/delGoods', data)
}

export function selectGoods() {
  return request.get('/shopping-cart/selectGoods')
}

export function getGoodDetail(id) {
  return request.get(`/getGoodDetail?id=${id}`)
}

export function goodSelectSku(data) {
  return request.post('/shopping-cart/goodSelectSku', data)
}

export function createOrder(data) {
  return request.post('/createOrder', data)
}

export function orderList(status) {
  return request.get(`/orderList?status=${status}`)
}

export function reputation(goodsId) {
  return request.get(`/reputation?goodsId=${goodsId}`)
}

export function coupons() {
  return request.get('/discounts/coupons')
}

export function hotGoods() {
  return request.get('/hotGoods')
}

export function bannerList() {
  return request.get('/bannerList')
}

export function seckill() {
  return request.get('/seckill')
}

export function goodsDynamic () {
  return request.get('/goodsDynamic')
}

export function notice ({pageSize}) {
  return request.get(`/notice?pageSize=${pageSize}`)
}

export function discount () {
  return request.get('/discount')
}

export function collage() {
  return request.get('/collage')
}

export function advertisement() {
  return request.get('/advertisement')
}

export function createQRCode (data) {
  return request.post('/createQRCode', data)
}