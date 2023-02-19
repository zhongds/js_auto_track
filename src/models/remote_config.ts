import { IConfig, setConfig } from "../config/config";
import { get } from "../request/request";

interface IRemoteConfigData {
  enable: boolean,
  collect_event_type: {
    enableClick?: boolean,
    enablePV?: boolean,
    enableError?: boolean,
    enableApi?: boolean,
    enableRes?: boolean
  },
  collect_click_elm?: {
    button?: boolean,
    a?: boolean,
    input?: boolean,
    textarea?: boolean,
    div?: boolean,
    i?: boolean,
    img?: boolean,
    em?: boolean
  },
  ignore_page?: {
    [key:string]: boolean,
  }
}

/**
 * 远端配置管理
 */
export default class RemoteConfig {
  static fetchConfig(url: string, fn: Function) {
    const ins = new RemoteConfig();
    ins.init(url, fn);
  }

  /**
   * 回调方法, 不管成功还是失败
   *
   * @private
   * @type {Function}
   * @memberof RemoteConfig
   */
  private callbackFn: Function;
  private init(url: string, fn: Function) {
    this.callbackFn = fn;
    this.fetchConfig(url);
  }

  private fetchConfig(url: string) {
    const _this = this;
    get(url, {
      onError(err) {
        console.error('拉取远端配置失败: ', err);
        setConfig({enable: false} as IConfig);
        _this.callbackFn();
      },
      onSuccess(res) {
        console.log('远端配置内容：', res);
        _this.parseConfig(res);
      },
    })
  }

  private parseConfig(data: string) {
    try {
      const obj = JSON.parse(data) as IRemoteConfigData;
      const {enable, collect_event_type, collect_click_elm, ignore_page} = obj;
      setConfig({
        enable,
        ...collect_event_type,
        collectClickElmType: collect_click_elm,
        ignorePage: ignore_page,
      } as IConfig);
    } catch(err) {
      console.error('解析远端配置失败', err);
      setConfig({enable: false} as IConfig);
    }
    this.callbackFn();
  }
}
