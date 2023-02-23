import { IConfig, setConfig } from "../config/config";
import { get } from "../request/request";

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
      const {enable, includes, excludes} = obj;
      const eventObj = {};
      const eventKeys = ['pv', 'click', 'api', 'error'];
      includes.forEach(item => {
        (item.events || []).forEach(k => {
          if (eventKeys.indexOf(k) !== -1) {
            eventObj[k] = { ...item, enable: true };
            delete eventObj[k].events;
            if (eventObj[k].pages) {
              eventObj[k].include_pages = eventObj[k].pages;
              delete eventObj[k].pages;
            }
          }
        })
      });
      excludes.forEach(item => {
        (item.events || []).forEach(k => {
          if (eventKeys.indexOf(k) !== -1) {
            if (item.pages) {
              eventObj[k].exclude_pages = item.pages;
            }
          }
        })
      });
      const conf = {
        enable,
        ...eventObj,
      } as IConfig;
      setConfig(conf);
    } catch(err) {
      console.error('解析远端配置失败', err);
      setConfig({enable: false} as IConfig);
    }
    this.callbackFn();
  }
}
