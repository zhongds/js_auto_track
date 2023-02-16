import { MemoryCache } from './models/cache';
import { Config, IConfig, setConfig } from './config/config';
import { setGlobalCache } from './config/global';
import { handleClick, handleResource } from './handler';
import { hookHistorySate, hookPopstate, setPage } from './hook';
import ApiPerf from './plugins/Api_perf';
import WrapError from './plugins/error';
import { on, rewriteEventStopPropagation } from './utils/tool';
import { RouteIntercept } from './models/trace';
import { setDeviceIdFn, setLoginUserIdFn, setUserSessionIdFn } from './models/message';

export default class AutoTrackObj {
  constructor(option: IConfig) {
    this.init(option);
  }

  init(option: IConfig) {
    setConfig(option);
    setGlobalCache(new MemoryCache());
    // 全局配置：拦截url
    new RouteIntercept();

    Config.enableClick && this.addListenClick(); // done
    Config.enablePV && this.addListenPV(); // done
    Config.enableRes && this.sendResource();
    Config.enableError && this.addListenError(); // done
    // Config.enableApi && this.addListenApi();  // done TODO
    Config.enableSPA && this.addListenStateChange(); // done

    console.log("配置====", Config);
    this.addListenClose();
  }

  static setUserId(fn: Function) {
    setLoginUserIdFn(fn);
  }

  static setUserSessionId(fn: Function) {
    setUserSessionIdFn(fn);
  }

  static setDeviceId(fn: Function) {
    setDeviceIdFn(fn);
  }


  private addListenClick() {
    on('click', handleClick);
    // TODO 专门管理，重写Event事件
    rewriteEventStopPropagation(handleClick);
  }

  /**
   * 监听路由变化
   * 1. hash变化: 监听popstate
   * 2. 浏览器前进后退：监听popstate
   */
  private addListenPV() {
    // 首次加载设置页面变化
    'complete' === window.document.readyState ? setPage() : on('load', setPage);
    hookPopstate();
  }

  /**
   * 监听路由变化
   * 3. pustState/replaceState => hash变化，路径变化, 不会触发popstate事件 => 重写这两个方法
   */
   private addListenStateChange() {
    hookHistorySate('pushState');
    hookHistorySate('replaceState');
  }

  // 发送资源
  private sendResource() {
    'complete' === window.document.readyState ? handleResource() : on('load', handleResource);
  }

  private addListenError() {
    new WrapError();
  }

  private addListenApi() {
    new ApiPerf();
  }

  private addListenClose() {
    on('beforeunload', function() {
      console.log('页面关闭');
    })
  }
}