import { setConfig } from "./config";
import { get } from "../request/request";
import TrackLog from "../models/log";

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
    get(url).then(res => {
      TrackLog.log('远端配置内容：', res);
      _this.parseConfig(res);
    }).catch(err => {
      TrackLog.error('拉取远端配置失败: ', err);
      setConfig({enable: false} as IConfig);
    }).finally(() => {
      _this.callbackFn();
    })
  }

  private parseConfig(rconf: string) {
    try {
      const obj = JSON.parse(rconf) as IRemoteConfigData;
      const conf = {} as IConfig;
      const {data, configs} = obj;
      if (data) {
        // TODO lua配置过滤
      }
      if (configs) {
        const {disableSDK, event_blacklist, disableDebugMode} = configs;
        conf.enable = !disableSDK;
        conf.env = disableDebugMode ? 'release' : 'dev';
        conf.event_blacklist = event_blacklist || [];
      }
      setConfig(conf);
    } catch(err) {
      // TODO 上报配置失败原因
      TrackLog.error('解析远端配置失败', err);
    }
  }
}
