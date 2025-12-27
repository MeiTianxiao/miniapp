const TOOLS = require('../../utils/tools.js')
import Bigjs from 'big.js'
import { goodsInfo, modifyNumber, goodSelect, delGoods } from '../../apis/products'

Page({
  data: {
    delBtnWidth: 120, //删除按钮宽度单位（rpx）
    shippingCarInfo:{}
  },

  //获取元素自适应后的实际宽度
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getSystemSetting().windowWidth
      console.log(res, 'res')
      // 窗口是给的px单位，需要换算成rpx
      var scale = (750 / 2) / (w / 2)
      // console.log(scale);
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },
  onLoad: function () {
    this.initEleWidth();
    this.onShow();
    this.setData({
      shopping_cart_vop_open: wx.getStorageSync('shopping_cart_vop_open')
    })
  },
  onShow: function () {
    this.shippingCarInfo()
    TOOLS.showTabBarBadge()
  },
  async shippingCarInfo() {
    const res = await goodsInfo()
    let totalPrice = 0
    console.log('goodsInfo返回结果：', res) // 新增这行，查看实际返回内容
    // 计算总价
    res.items.forEach(ele => {
      if (ele.selected) {
        totalPrice = Bigjs(totalPrice).plus(Bigjs(ele.number).times(ele.price)).toNumber()
      }
    })
    res.price = totalPrice
    this.setData({
      shippingCarInfo: res || []
    })
  },
  toIndexPage: function () {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },

  touchS: function (e) {
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      });
    }
  },
  touchM: function (e) {
    const index = e.currentTarget.dataset.index;
    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      if (disX == 0 || disX < 0) { //如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      } else if (disX > 0) { //移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          left = "left:-" + delBtnWidth + "px";
        }
      }
      this.data.shippingCarInfo.items[index].left = left
      this.setData({
        shippingCarInfo: this.data.shippingCarInfo
      })
    }
  },

  touchE: function (e) {
    var index = e.currentTarget.dataset.index;
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
      this.data.shippingCarInfo.items[index].left = left
      this.setData({
        shippingCarInfo: this.data.shippingCarInfo
      })
    }
  },
  async delItem(e) {
    const key = e.currentTarget.dataset.key
    this.delItemDone(key)
  },
  async delItemDone(key) {
    await delGoods({ key })
    this.shippingCarInfo()
    TOOLS.showTabBarBadge()
  },
  async jiaBtnTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.shippingCarInfo.items[index]
    console.log(index, 'index')

    const number = item.number + 1
    await modifyNumber({ key: item.pid || item.id, number })  
    this.shippingCarInfo()
  },
  async jianBtnTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.shippingCarInfo.items[index]
    console.log(item, 'item')
    const number = item.number - 1
    if (number <= 0) {
      // 弹出删除确认
      wx.showModal({
        content: '确定要删除该商品吗？',
        success: (res) => {
          if (res.confirm) {
            this.delItemDone(item.pid || item.id)
          }
        }
      })
      return
    }
    await modifyNumber({ key: item.pid || item.id, number })
    this.shippingCarInfo()
  },
  async radioClick(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.shippingCarInfo.items[index]
    // 这里pid和id是针对商品是否有规格的情况
    await goodSelect({ key: item.pid || item.id, selected: !item.selected })
    this.shippingCarInfo()
    TOOLS.showTabBarBadge()
  },
  // onChange(event) {
  //   this.setData({
  //     shopCarType: event.detail.name
  //   })
  //   this.shippingCarInfo()
  // }
})