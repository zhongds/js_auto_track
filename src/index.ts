import { MemoryCache } from './models/cache';
import { Config, IConfig, setConfig } from './config/config';
import { setGlobalCache } from './config/global';
import { handleResource } from './handler';
import ApiPerf from './plugins/Api_perf';
import WrapError from './plugins/error';
import { on } from './utils/tool';
import { RouteIntercept } from './models/trace';
import { setDeviceIdFn, setLoginUserIdFn, setUserSessionIdFn } from './models/message';
import PageViewPerf from './plugins/page_view';
import ClickEvent from './plugins/click_event';

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

  constructor(option: IConfig) {
    // TODO 后面去掉，暂时只是为了兼容个人中心页面bug
    setTimeout(() => {
      this.init(option);  
    }, 50);
  }

  init(option: IConfig) {
    setConfig(option);
    setGlobalCache(new MemoryCache());
    
    new RouteIntercept();

    Config.enableClick && this.addListenClick(); // done
    Config.enablePV && this.addListenPV(Config.enableSPA); // done
    Config.enableRes && this.sendResource();
    Config.enableError && this.addListenError(); // done
    // Config.enableApi && this.addListenApi();  // done TODO

    console.log("配置====", Config);
  }

  private addListenClick() {
    ClickEvent.autoTrack();
  }

  /**
   * 上报PV
   * @param enableSPA 是否支持SPA页面
   */
  private addListenPV(enableSPA?: boolean) {
    PageViewPerf.autoTrack(enableSPA);
  }

  // 发送资源
  private sendResource() {
    'complete' === window.document.readyState ? handleResource() : on('load', handleResource);
  }

  private addListenError() {
    WrapError.autoTrack();
  }

  private addListenApi() {
    ApiPerf.autoTrack();
  }
}