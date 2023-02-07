/**
 * 默认点击元素类型
 * true-监听该类型元素的点击事件
 */
const DEFAULT_CLICK_EL_TYPE = {
  button: true,
  a: true,
  input: true,
  textarea: true,
  span: true,
  li: true,
  i: true,
  img: true,
  em: true,
  div: true, // 只抓叶子节点
}

export interface IConfig {
  reportUrl: string, //上报地址
  enablePV?: boolean, //是否上报PV, 带上性能数据
  enableError?: boolean, //是否上报错误
  enableRes?: boolean, //是否上报资源加载情况
  enableDbClick?: boolean, //是否上报双击事件
  enableFetch?: boolean, //是否上报fetch
  collectClickElmType: {
    button: boolean,
    a: boolean,
    input: boolean,
    textarea: boolean,
    span: boolean,
    li: boolean,
    i: boolean,
    img: boolean,
    em: boolean,
    div: boolean, // 只抓叶子节点
    [key: string]: boolean,
  },
}


const defaultConfig: IConfig = {
  reportUrl: '',
  enablePV: true,
  enableError: true,

  enableRes: false,
  enableDbClick: false,
  enableFetch: false,

  collectClickElmType: {
    ...DEFAULT_CLICK_EL_TYPE,
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
    }
  }
}
