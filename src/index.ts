import { MemoryCache } from './models/cache';
import { Config, IOption, setConfig } from './config/config';
import { setGlobalCache } from './config/global';
import { handleResource } from './handler';
import ApiPerf from './plugins/Api_perf';
import WrapError from './plugins/error';
import { on } from './utils/tool';
import { RouteIntercept } from './models/trace';
import { setDeviceIdFn, setLoginUserIdFn, setUserSessionIdFn } from './models/message';
import PageViewPerf from './plugins/page_view';
import ClickEvent from './plugins/click_event';
import RemoteConfig from './models/remote_config';
import 'es6-promise/auto';

export default class AutoTrackObj {
  static setUserId(fn: Function) {
    setLoginUserIdFn(fn);
  }

  static setUserSessionId(fn: Function) {
    setUserSessionIdFn(fn);
  }

  static setDeviceId(fn: Function) {
    setDeviceIdFn(fn);
  }

  constructor(option: IOption) {
    setConfig(option);
    if (option.remoteConfigUrl) {
      RemoteConfig.fetchConfig(option.remoteConfigUrl, () => {
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
    console.log("配置====", Config);
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
