// const WXAPI = require('apifm-wxapi')
const TOOLS = require('../../utils/tools.js')
const AUTH = require('../../utils/auth')
const { hotGoods, bannerList, category, seckill, goodsDynamic, goodlist, notice, discount, collage, advertisement } = require('../../apis/products')

const APP = getApp()

Page({
  data: {
    goodsRecommend: [], // 推荐商品
    kanjiaList: [], //砍价商品列表
    pingtuanList: [], //拼团商品列表
    selectCurrent: 0,
    categories: [],
    goods: [],
    loadingMoreHidden: true,
    coupons: [],
    curPage: 1,
    pageSize: 20
  },
  tabClick(e) {
    // 商品分类点击
    const category = this.data.categories.find(ele => {
      return ele.id == e.currentTarget.dataset.id
    })
    wx.setStorageSync("_categoryId", category.id)
    wx.switchTab({
      url: '/pages/category/category',
    })
  },
  // tabClickCms(e) {
  //   // 文章分类点击
  //   const category = this.data.cmsCategories[e.currentTarget.dataset.idx]
  //   wx.navigateTo({
  //     url: '/pages/cms/list?categoryId=' + category.id,
  //   })
  // },
  toDetailsTap: function(e) {
    const id = e.currentTarget.dataset.id
    const supplytype = e.currentTarget.dataset.supplytype
    const yyId = e.currentTarget.dataset.yyid
    if (supplytype == 'cps_jd') {
      wx.navigateTo({
        url: `/packageCps/pages/goods-details/cps-jd?id=${id}`,
      })
    } else if (supplytype == 'vop_jd') {
      wx.navigateTo({
        url: `/pages/goods-details/vop?id=${yyId}&goodsId=${id}`,
      })
    } else if (supplytype == 'cps_pdd') {
      wx.navigateTo({
        url: `/packageCps/pages/goods-details/cps-pdd?id=${id}`,
      })
    } else if (supplytype == 'cps_taobao') {
      wx.navigateTo({
        url: `/packageCps/pages/goods-details/cps-taobao?id=${id}`,
      })
    } else {
      wx.navigateTo({
        url: `/pages/goods-details/index?id=${id}`,
      })
    }
  },
  tapBanner: function(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.navigateTo({
        url
      })
    }
  },
  onLoad: function(e) {
    wx.showShareMenu({
      withShareTicket: true,
    })
    const that = this
    // 读取分享链接中的邀请人编号
    if (e && e.inviter_id) {
      wx.setStorageSync('referrer', e.inviter_id)
    }
    // 读取小程序码中的邀请人编号
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene)
      if (scene) {        
        wx.setStorageSync('referrer', scene.substring(11))
      }
    }
    // 静默式授权注册/登陆
    AUTH.checkHasLogined().then(isLogined => {
      if (!isLogined) {
        // 授权登录
        AUTH.newAuthorize().then(() => {
          AUTH.bindSeller()
          TOOLS.showTabBarBadge()
        })
      } else {
        AUTH.bindSeller()
        TOOLS.showTabBarBadge()
      }
    })
    this.initBanners()
    this.categories()
    hotGoods().then(res => {
      this.setData({
        goodsRecommend: res.data.result
      })
    })
    that.getNotice()
    that.kanjiaGoods()
    that.pingtuanGoods()
    this.adPosition()
    this.setData({
      mallName: wx.getStorageSync('mallName')
    })
  },
  async miaoshaGoods(){
    const res = await seckill()
    if (res.code == 10000) {
      res.data.result.forEach(ele => {
        const _now = new Date().getTime()
        if (ele.dateStart) {
          ele.dateStartInt = new Date(ele.dateStart.replace(/-/g, '/')).getTime() - _now
        }
        if (ele.dateEnd) {
          ele.dateEndInt = new Date(ele.dateEnd.replace(/-/g, '/')).getTime() -_now
        }
      })
      this.setData({
        miaoshaGoods: res.data.result
      })
    }
  },
  async initBanners(){
    // 读取头部轮播图
    const res = await bannerList()
    this.setData({
      banners: res.data
    })
  },
  onShow: function(e){
    this.setData({
      navHeight: APP.globalData.navHeight,
      navTop: APP.globalData.navTop,
      windowHeight: APP.globalData.windowHeight,
      menuButtonObject: APP.globalData.menuButtonObject //小程序胶囊信息
    })
    // 获取购物车数据，显示TabBarBadge
    TOOLS.showTabBarBadge()
    this.goodsDynamic()
    this.miaoshaGoods()
  },
  async goodsDynamic(){
    const res = await goodsDynamic()
    if (res.code == 10000) {
      this.setData({
        goodsDynamic: res.data
      })
    }
  },
  async categories(){
    const res = await category()
    let categories = [];
    if (res.code == 10000) {
      const _categories = res.data.filter(ele => {
        return ele.level == 1
      })
      categories = categories.concat(_categories)
    }
    this.setData({
      categories: categories,
      curPage: 1
    });
    this.getGoodsList(0);
  },
  async getGoodsList(categoryId, append) {
    if (categoryId == 0) {
      categoryId = "";
    }
    wx.showLoading({
      "mask": true
    })
    const res = await goodlist({
      categoryId: categoryId,
      page: this.data.curPage,
      pageSize: this.data.pageSize
    })
    wx.hideLoading()
    if (res.code == 404 || res.code == 700) {
      let newData = {
        loadingMoreHidden: false
      }
      if (!append) {
        newData.goods = []
      }
      this.setData(newData);
      return
    }
    let goods = [];
    if (append) {
      goods = this.data.goods
    }
    for (var i = 0; i < res.data.result.length; i++) {
      goods.push(res.data.result[i]);
    }
    this.setData({
      loadingMoreHidden: true,
      goods: goods,
    });
  },
  getNotice: async function() {
    const res = await notice({pageSize: 5})
    if (res.code == 10000) {
      this.setData({
        noticeList: res.data
      })
    }
  },
  // 上拉触底函数
  onReachBottom: function() {
    this.setData({
      curPage: this.data.curPage + 1
    });
    this.getGoodsList(0, true)
  },
  // 获取砍价商品
  async kanjiaGoods(){
    const res = await discount()
    if (res.code == 10000) {
      const kanjiaGoodsIds = []
      res.data.result.forEach(ele => {
        kanjiaGoodsIds.push(ele.id)
      })
      this.setData({
        kanjiaList: res.data.result
      })
    }
  },
  goCoupons: function (e) {
    wx.switchTab({
      url: "/pages/coupons/index"
    })
  },
  async pingtuanGoods(){ // 获取团购商品列表
    const res = await collage()
    if (res.code === 10000) {
      this.setData({
        pingtuanList: res.data.result
      })
    }
  },
  goSearch(){
    wx.navigateTo({
      url: '/pages/search/index'
    })
  },
  goNotice(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/notice/show?id=' + id,
    })
  },
  async adPosition() {
    let res = await advertisement()
    if (res.code == 10000) {
      this.setData({
        adPositionIndexPop: res.data
      })
    }
  },
  closeAdPositionIndexPop() {
    this.setData({
      adPositionIndexPop: null
    })
  },
  clickAdPositionIndexPop() {
    const adPositionIndexPop = this.data.adPositionIndexPop
    this.setData({
      adPositionIndexPop: null
    })
    if (!adPositionIndexPop || !adPositionIndexPop.url) {
      return
    }
    wx.navigateTo({
      url: adPositionIndexPop.url,
    })
  }
})