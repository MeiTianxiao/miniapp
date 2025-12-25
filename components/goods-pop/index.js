const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const TOOLS = require('../../utils/tools.js') // TOOLS.showTabBarBadge();
const { getGoodDetail, goodSelectSku } = require('../../apis/products')

Component({
  behaviors: [],
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的对外属性，是属性名到属性设置的映射表
   */
  properties: {  
    skuCurGoodsBaseInfo: null,
  },

  /**
   * 组件的内部数据，和 properties 一同用于组件的模板渲染
   */
  data: {
    skuCurGoodsShow: false,
    skuCurGoods: undefined
  },
  // 组件数据字段监听器，用于监听 properties 和 data 的变化
  observers: {
    'skuCurGoodsBaseInfo': function(skuCurGoodsBaseInfo) {
      // console.log('observers-skuCurGoodsBaseInfo', skuCurGoodsBaseInfo)
      if (!skuCurGoodsBaseInfo) {
        return
      }
      if (skuCurGoodsBaseInfo.stores <= 0) {
        wx.showToast({
          title: '已售罄~',
          icon: 'none'
        })
        return
      }
      this.initGoodsData(skuCurGoodsBaseInfo)
    }
  },
  lifetimes: {
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  pageLifetimes: {
    hide: function () { },
    resize: function () { },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    closeSku(){
      // 关闭弹窗
      this.setData({
        skuCurGoodsShow: false
      })
      wx.showTabBar()
    },
    async initGoodsData(skuCurGoodsBaseInfo) {
      // 获取商品详情
      const skuCurGoodsRes = await getGoodDetail(skuCurGoodsBaseInfo.id)
      wx.hideTabBar()
      const skuCurGoods = skuCurGoodsRes.data
      skuCurGoods.basicInfo.storesBuy = 1
      console.log(skuCurGoods, 'skuCurGoods')
      // 处理可选配件
      this.setData({
        skuCurGoods,
        skuGoodsPic: skuCurGoods.basicInfo.pic,
        selectSizePrice: skuCurGoods.basicInfo.minPrice,
        // selectSizeOPrice: skuCurGoods.basicInfo.originalPrice,
        skuCurGoodsShow: true
      })
    },
    storesJia(){
      const skuCurGoods = JSON.parse(JSON.stringify(this.data.skuCurGoods))
      // 判断当前沟通数量是否小于库存
      if (skuCurGoods.basicInfo.storesBuy < skuCurGoods.basicInfo.stores) {
        skuCurGoods.basicInfo.storesBuy++
        this.setData({
          skuCurGoods
        })
      }
    },
    storesJian(){
      const skuCurGoods = JSON.parse(JSON.stringify(this.data.skuCurGoods))
      if (skuCurGoods.basicInfo.storesBuy > 1) {
        skuCurGoods.basicInfo.storesBuy--
        this.setData({
          skuCurGoods
        })
      }
    },
    skuSelect(e){
      const skuCurGoods = JSON.parse(JSON.stringify(this.data.skuCurGoods))
      const propertyindex = e.currentTarget.dataset.propertyindex
      const propertychildindex = e.currentTarget.dataset.propertychildindex
      const property = skuCurGoods.properties[propertyindex]
      const child = property.childsCurGoods[propertychildindex]
      // 当前位置往下的所有sku取消选中状态
      for (let index = propertyindex; index < skuCurGoods.properties.length; index++) {
        const element = skuCurGoods.properties[index]
        element.childsCurGoods.forEach(child => {
          child.active = false
        })
      }
      // 处理选中
      property.childsCurGoods.forEach(ele => {
        if (ele.id == child.id) {
          ele.active = true
        } else {
          ele.active = false
        }
      })
      // 显示图片
      let skuGoodsPic = this.data.skuGoodsPic
      if (skuCurGoods.subPics && skuCurGoods.subPics.length > 0) {
        const _subPic = skuCurGoods.subPics.find(ele => {
          return ele.optionValueId == child.id
        })
        if (_subPic) {
          skuGoodsPic = _subPic.pic
        }
      }
      this.setData({
        skuCurGoods,
        skuGoodsPic
      })
    },
    async addCarSku(){
      // 校验是否有未选中的sku
      if (!this.checkSkuSelect(this.data.skuCurGoods)) {
          wx.showToast({
            title: '请选择规格/配件',
            icon: 'none'
          })
          return
      }
      const res = await goodSelectSku({ goodInfo: this.data.skuCurGoods, pic: this.data.skuGoodsPic })
      wx.showToast({
        title: '加入成功',
        icon: 'success'
      })
      wx.showTabBar()
      TOOLS.showTabBarBadge() // 获取购物车数据，显示TabBarBadge
      this.setData({
        skuCurGoodsShow: false
      })
    },
    checkSkuSelect(product) {
      console.log(product, 'product')
      if (product.properties && product.properties.length) {
        // 记录每次的结果
        const checkResult = []
        product.properties.forEach((item, index) => {
          checkResult.push(false)
          item.childsCurGoods.forEach(child => {
            if (child.active) {
              checkResult[index] = true
            }
          })
        })
        if (checkResult.length === 0) {
          return false
        } else {
          return !checkResult.filter(el => !el).length
        }
      }
      return flag
    }
  }
})