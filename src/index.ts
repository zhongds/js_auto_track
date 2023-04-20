import { MemoryCache } from './plugins/cache';
import { Config, setConfig } from './config/config';
import { setGlobalCache } from './config/global';
import { handleResource } from './handler';
import ApiPerf from './events/Api_perf';
import WrapError from './events/error';
import { on } from './utils/tool';
import { RouteIntercept } from './plugins/trace';
import { setDeviceIdFn, setGuidFn, setLoginUserIdFn, setUserSessionIdFn } from './models/message';
import PageViewPerf from './events/page_view';
import ClickEvent from './events/click_event';
import RemoteConfig from './config/remote_config';
import 'es6-promise/auto';
import TrackLog from './plugins/log';
import { setUserCommonProperty } from './models/user_property';
import PluginManager from './plugin_manager';
import UserDefined from './events/user_defined';
import PageLeave from './events/page_leave';

export default class AutoTrackObj {

  static setUserId(fn: UserPropertyType) {
    setLoginUserIdFn(fn);
  }

  static setUserSessionId(fn: UserPropertyType) {
    setUserSessionIdFn(fn);
  }

  static setDeviceId(fn: UserPropertyType) {
    setDeviceIdFn(fn);
  }

  static setGuid(fn: UserPropertyType) {
    setGuidFn(fn);
  }

  /**
   * 设置通用的全局属性，支持静态和动态设置
   * @param key 
   * @param fn 基础类型或者function
   */
  static setGlobalCommonProperty(key: string, fn: UserPropertyType) {
    setUserCommonProperty(key, fn);
  }

  static init(option: IOption) {
    setConfig(option);
    if (option.log) {TrackLog.setLevel(option.log)}; // 设置日志级别
    if (option.remoteConfigUrl) {
      RemoteConfig.fetchConfig(option.remoteConfigUrl, () => {
        if (Config.log !== option.log) {TrackLog.setLevel(Config.log)}; // 重置日志级别
        this.start();
      })
    } else {
      // TODO setTimeout后面去掉，暂时只是为了兼容个人中心页面bug
      setTimeout(() => {
        this.start();
      }, 50);
    }
  }

  private static start() {
    TrackLog.info("配置====", Config);
    if (!Config.enable) return;

    setGlobalCache(new MemoryCache());
    new RouteIntercept(); 
    Config.pv && PageViewPerf.autoTrack(Config.pv); // done
    Config.click && ClickEvent.autoTrack(Config.click); // done
    Config.res && this.sendResource(); // TODO
    Config.error && WrapError.autoTrack(Config.error); // done
    Config.api && ApiPerf.autoTrack(Config.api);  // done
    Config.page_leave && PageLeave.autoTrack(Config.page_leave); // done
  }

  // 发送资源
  private static sendResource() {
    'complete' === window.document.readyState ? handleResource() : on('load', handleResource);
  }

  /**
   * 加载插件
   * @param plugin 插件
   * @param option 插件配置
   */
  static use(plugin: IBasePlugin, option?) {
    PluginManager.use(plugin, option);
  }

  static track(eventName: string, data: UserMessage) {
    UserDefined.track(eventName, data);
  }
}
