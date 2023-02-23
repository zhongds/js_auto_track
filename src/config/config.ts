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

export interface IOption {
  appId: string, //
  secret: string, // 密钥
  reportUrl: string, //上报地址
  remoteConfigUrl: string, // 远端配置地址
}

export interface IConfig extends IOption {
  enable?: boolean, // 是否开启全埋点，默认true
  pv?: IPageViewEventCapacity,
  click?: IClickEventCapacity,
  api?: IApiEventCapacity,
  error?: IErrorEventCapacity,
  res?: IResEventCapacity,
}

function getDefaultElementTypes(): string[] {
  const obj = {...DEFAULT_CLICK_ELM_TYPE, ...COLLECT_CUR_OR_UP_ELM_TYPE};
  const elmTypes = Object.keys(obj).reduce((res, cur) => {
    if (obj[cur]) {
      res.push(cur);
    }
    return res;
  }, []);
  return elmTypes;
}

// ============只有远端配置开启对应的事件，才会把默认配置跟远端配置合并==============
// 默认pv的能力
const defaultPVCapacity: IPageViewEventCapacity = {
  enable: true,
  spa: false,
  capture: false,
}

const defaultClickCapacity: IClickEventCapacity = {
  enable: true,
  capture: false,
  element_types: getDefaultElementTypes(),
}

const defaultApiCapacity: IApiEventCapacity = {
  enable: true,
}

const defaultErrorCapacity: IErrorEventCapacity = {
  enable: true,
}
//=========================================================================

const defaultConfig: IConfig = {
  appId: '',
  secret: '',
  reportUrl: '',
  remoteConfigUrl: '',

  enable: false, // 默认false，不上报
}

export let Config = defaultConfig;

export function setConfig(conf?: IConfig) {
  Config = {
    ...Config,
    ...conf,
  };
  if (Config.click && !Config.click.element_types) {
    Config.click.element_types = defaultClickCapacity.element_types;
  }
}



