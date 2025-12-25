import Fly from "flyio";
// import StorageSync from "@modules/user/userInfo";
import "./lodash-fix"
import _ from "lodash";

const fly = new Fly();

fly.config.baseURL = "https://wxcode.itndedu.com/mall"
// fly.config.baseURL = "https://tzapi.mynatapp.cc/mall"

// fly.config.baseURL = "http://127.0.0.1:3300/mall"
fly.config.timeout = 1000 * 20;
// fly.config.headers.Accept = "application/json";

export class RequestError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

fly.interceptors.request.use((request) => {
  const uid = wx.getStorageSync('uid')
  const token = wx.getStorageSync('token')
  if (uid || token) {
    request.headers["uid"] = uid
    request.headers["token"] = token
  }
  // const userInfo = StorageSync.GetLocalUser();
  // if (userInfo && userInfo.token) {
  //   request.headers["Authorization"] = userInfo.token;
  // }
  // // 本地缓存中有同盾设备指纹信息，并且请求体中有参数，则在请求体中添加blackbox参数
  // const blackBox = wx.getStorageSync("blackBox")?.value;

  return request;
});

// 添加响应拦截器，响应拦截器会在then/catch处理之前执行
fly.interceptors.response.use(
  (response) => {
    const { status, data } = response;
    if (status !== 200) {
      const message = "[Fetch]: 网络开了小差";
      return Promise.reject(new RequestError(message));
    }
    return data;
  },
  // 网络错误
  (err) => {
    console.log(err, "网络错误");
    if (!err) err = {};
    err.message = "网络异常，请稍后重试";
    setTimeout(() => {
      wx.showToast({
        title: err.message,
        icon: "none"
      });
    }, 100);

    return Promise.reject(err);
  }
);

export default fly;
