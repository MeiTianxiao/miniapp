// pages/my/change-user.js
import { updateUserInfo } from '../../apis/login'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: "",
    nickname: ""
  },
  onLoad(options) {
    console.log(options)
    if (options.userInfo) {
      const { avatarUrl, nick } = JSON.parse(options.userInfo)
      this.setData({
        avatarUrl,
        nickname: nick
      })
    }
  },
  onChooseAvatar(e) {
    console.log(e, 'onChooseAvatar')
    this.setData({
      avatarUrl: e.detail.avatarUrl
    })
  },
  handleChange(e) {
    console.log(e, 'e')
    this.setData({
      nickname: e.detail.value
    })
  },
  submit() {
    console.log(this.data.nickname)
    updateUserInfo({ 
      avatarUrl: this.data.avatarUrl,
      nickname: this.data.nickname
     }).then(() => {
      wx.reLaunch({
        url: '/pages/my/index'
        })
     })
  }
})