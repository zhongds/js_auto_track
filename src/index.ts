import { MemoryCache } from './models/cache';
import { Config, IOption, setConfig } from './config/config';
import { setGlobalCache } from './config/global';
import { handleResource } from './handler';
import ApiPerf from './plugins/Api_perf';
import WrapError from './plugins/error';
import { on } from './utils/tool';
import { RouteIntercept } from './models/trace';
import { setCommonProperty, setDeviceIdFn, setGuidFn, setLoginUserIdFn, setUserSessionIdFn } from './models/message';
import PageViewPerf from './plugins/page_view';
import ClickEvent from './plugins/click_event';
import RemoteConfig from './models/remote_config';
import 'es6-promise/auto';
import TrackLog from './models/log';

export default class AutoTrackObj {
  static setUserId(fn: CommonPropertyType) {
    setLoginUserIdFn(fn);
  }

  static setUserSessionId(fn: CommonPropertyType) {
    setUserSessionIdFn(fn);
  }

  static setDeviceId(fn: CommonPropertyType) {
    setDeviceIdFn(fn);
  }

  static setGuid(fn: CommonPropertyType) {
    setGuidFn(fn);
  }

  static setGlobalCommonProperty(key: string, fn: CommonPropertyType) {
    setCommonProperty(key, fn);
  }

  constructor(option: IOption) {
    setConfig(option);
    if (option.log) {TrackLog.setLevel(option.log)}; // 设置日志级别
    if (option.remoteConfigUrl) {
      RemoteConfig.fetchConfig(option.remoteConfigUrl, () => {
        if (Config.log !== option.log) {TrackLog.setLevel(Config.log)}; // 重置日志级别
        this.init();
      })
    } else {
      // TODO setTimeout后面去掉，暂时只是为了兼容个人中心页面bug
      setTimeout(() => {
        this.init();
      }, 50);
    }
  }

  init() {
    TrackLog.info("配置====", Config);
    if (!Config.enable) return;

    setGlobalCache(new MemoryCache());
    new RouteIntercept(); 
    Config.pv && PageViewPerf.autoTrack(Config.pv); // done
    Config.click && ClickEvent.autoTrack(Config.click); // done
    Config.res && this.sendResource(); // TODO
    Config.error && WrapError.autoTrack(Config.error); // done
    Config.api && ApiPerf.autoTrack(Config.api);  // done
  }

  // 发送资源
  private sendResource() {
    'complete' === window.document.readyState ? handleResource() : on('load', handleResource);
  }
}
