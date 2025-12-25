const AUTH = require('../../utils/auth')
const TOOLS = require('../../utils/tools.js')
const { category, addGoods, goodlist } = require('../../apis/products.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // categories: [],
    activeCategory: 0,
    categorySelected: {
      name: '',
      id: ''
    },
    currentGoods: [],
    onLoadStatus: true,
    scrolltop: 0,
    skuCurGoods: undefined,
    page: 1,
    pageSize: 20
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // wx.showShareMenu({
    //   withShareTicket: true
    // })
    this.categories();
  },
  onShow() {
    AUTH.checkHasLogined().then(isLogined => {
      if (isLogined) {
        this.setData({
          wxlogin: isLogined
        })
        TOOLS.showTabBarBadge() // 获取购物车数据，显示TabBarBadge
      }
    })
    const _categoryId = wx.getStorageSync('_categoryId')
    wx.removeStorageSync('_categoryId')
    if (_categoryId) {
      this.data.categorySelected.id = _categoryId
      this.categories();
    }
    TOOLS.showTabBarBadge();
  },
  async categories() {
    wx.showLoading({
      title: '',
    })
    const res = await category()
    wx.hideLoading()
    let activeCategory = 0
    let categorySelected = this.data.categorySelected
    if (res.code == 10000) {
      const categories = res.data
      // 返回一级菜单
      const firstCategories = categories.filter(ele => { return ele.level == 1 })
      // 定位到当前的tab页签
      if (this.data.categorySelected.id) {
        activeCategory = firstCategories.findIndex(ele => {
          return ele.id == this.data.categorySelected.id
        })
        categorySelected = firstCategories[activeCategory]
      } else {
        categorySelected = firstCategories[0]
      }
      this.setData({
        page: 1,
        activeCategory,
        // categories,
        firstCategories,
        categorySelected
      })
      this.getGoodsList()
    }
  },
  async getGoodsList() {
    wx.showLoading({
      title: '',
    })
    // if (this.data.secondCategoryId) {
    //   categoryId = this.data.secondCategoryId
    // } else if(this.data.categorySelected.id) {
    //   categoryId = this.data.categorySelected.id
    // }
    let categoryId = this.data.categorySelected.id
    const res = await goodlist({
      categoryId,
      page: this.data.page,
      pageSize: this.data.pageSize
    })
    console.log(res, 'res')
    wx.hideLoading()
    if (res.code == 700) {
      if (this.data.page == 1) {
        this.setData({
          currentGoods: null
        });
      } else {
        wx.showToast({
          title: '没有更多了',
          icon: 'none'
        })
      }
      return
    }
    if (this.data.page == 1) {
      this.setData({
        currentGoods: res.data.result
      })
    } else {
      this.setData({
        currentGoods: this.data.currentGoods.concat(res.data.result)
      })
    }
  },
  async onCategoryClick(e) {
    const idx = e.target.dataset.idx
    if (idx == this.data.activeCategory) {
      this.setData({
        scrolltop: 0,
      })
      return
    }
    const categorySelected = this.data.firstCategories[idx]
    this.setData({
      page: 1,
      secondCategoryId: '',
      activeCategory: idx,
      categorySelected,
      scrolltop: 0
    });
    this.getGoodsList();
  },
  bindconfirm(e) {
    this.setData({
      inputVal: e.detail
    })
    wx.navigateTo({
      url: '/pages/goods/list?name=' + this.data.inputVal,
    })
  },
  onShareAppMessage() {    
    return {
      title: '"' + wx.getStorageSync('mallName') + '" ' + wx.getStorageSync('share_profile'),
      path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
    }
  },
  async addShopCar(e) {
    const curGood = this.data.currentGoods.find(ele => {
      return ele.id == e.currentTarget.dataset.id
    })
    // 商品当前id
    if (!curGood) {
      return
    }
    if (!curGood.propertyIds && !curGood.hasAddition) {
      // 不需要选择sku直接调接口
      await addGoods(curGood)
      TOOLS.showTabBarBadge()
    } else {
      this.setData({
        skuCurGoods: curGood
      })
    }
  },
  goodsGoBottom() {
    this.setData({
      page: this.data.page + 1
    })
    this.getGoodsList()
  },
  searchscan() {
    wx.scanCode({
      scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'],
      success: res => {
        console.log(res, 'scanCode')
        this.setData({
          inputVal: res.result
        })
        wx.navigateTo({
          url: '/pages/goods/list?name=' + res.result,
        })
      }
    })
  }
})