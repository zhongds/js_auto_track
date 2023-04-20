import { setConfig } from "./config";
import { get } from "../request/request";
import TrackLog from "../plugins/log";

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
      _this.callbackFn();
    })
  }

  private parseConfig(data: string) {
    try {
      const obj = JSON.parse(data) as IRemoteConfigData;
      const {enable, capture, includes, excludes} = obj;
      const eventObj = {};
      const eventKeys = ['pv', 'click', 'api', 'error', 'page_leave'];
      includes.forEach(item => {
        (item.events || []).forEach(k => {
          if (eventKeys.indexOf(k) !== -1) {
            eventObj[k] = { ...eventObj[k], ...item, enable: true };
            this.transformIncludeData(eventObj[k]);
          } else if (k === '*') {
            eventKeys.forEach(ek => {
              eventObj[ek] = {...eventObj[ek], ...item, enable: true};
              this.transformIncludeData(eventObj[ek]);
            })
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
      this.dealSpecialEvent(eventObj); // 特殊处理
      const conf = {
        enable,
        capture,
        ...eventObj,
      } as IConfig;
      setConfig(conf);
    } catch(err) {
      TrackLog.error('解析远端配置失败', err);
      setConfig({enable: false} as IConfig);
    }
    this.callbackFn();
  }

  /**
   * 转换数据
   * @param obj 
   */
  private transformIncludeData(obj) {
    delete obj.events;
    if (obj.pages) {
      obj.include_pages = obj.pages;
      delete obj.pages;
    }
  }

  /**
   * 特殊处理
   * 1. pv没配置，page_leave即使配置了也不生效
   * @param eventObj 转换后的事件对象
   */
  private dealSpecialEvent(eventObj) {
    if (eventObj.page_leave && !eventObj.pv) {
      eventObj.page_leave.enable = false;
    }
  }
}
