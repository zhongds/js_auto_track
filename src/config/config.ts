/**
 * 默认点击元素类型，只判断点击的元素，不会向上查找
 * true-监听该类型元素的点击事件
 */
const DEFAULT_CLICK_ELM_TYPE = {
  i: true,
  img: true,
  em: true,
  div: true, // 只抓叶子节点
}

/**
 * 点击元素，会向上查找元素类型，如果匹配上就上报
 */
export const COLLECT_CUR_OR_UP_ELM_TYPE = {
  button: true,
  a: true,
  input: true,
  textarea: true,
};

export interface IConfig {
  appId: string, //
  secret: string, // 密钥
  reportUrl: string, //上报地址

  enable?: boolean, // 是否开启全埋点，默认true
  enablePV?: boolean, //是否上报PV, 带上性能数据
  enableSPA?: boolean, //是否是单页应用，true-重写pushState和replaceState方法
  enableClick?: boolean, //是否上报点击事件
  enableError?: boolean, //是否上报错误
  enableRes?: boolean, //是否上报资源加载情况
  enableDbClick?: boolean, //是否上报双击事件
  enableApi?: boolean, //是否上报http请求数据

  collectClickElmType?: {
    i?: boolean,
    img?: boolean,
    em?: boolean,
    div?: boolean, // 只抓叶子节点
    [key: string]: boolean,
  },
  ignorePage?: { // 不采集的页面
    [key: string]: boolean,
  }
  remoteUrl?: string, // 远端配置地址
}


const defaultConfig: IConfig = {
  appId: '',
  secret: '',
  reportUrl: '',

  enable: true,
  enablePV: true,
  enableClick: true,
  enableError: true,

  enableSPA: false,
  enableRes: false,
  enableDbClick: false,
  enableApi: false,

  collectClickElmType: {
    ...DEFAULT_CLICK_ELM_TYPE,
    ...COLLECT_CUR_OR_UP_ELM_TYPE,
  }
}

export let Config = defaultConfig;
export function setConfig(option?: IConfig) {
  Config = {
    ...Config,
    ...option,
    collectClickElmType: {
      ...Config.collectClickElmType,
      ...option.collectClickElmType,
    },
    ignorePage: {
      ...Config.ignorePage,
      ...option.ignorePage,
    }
  }
  changeAutoTrackUpElmType(Config.collectClickElmType);
}

/**
 * 改变需要向上跟踪的元素类型
 */
function changeAutoTrackUpElmType(obj: any) {
  Object.keys(COLLECT_CUR_OR_UP_ELM_TYPE).forEach((k) => {
    if (obj[k] === false) {
      COLLECT_CUR_OR_UP_ELM_TYPE[k] = false;
    }
  })
}




