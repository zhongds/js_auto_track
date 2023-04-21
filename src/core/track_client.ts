import { setDeviceIdFn, setGuidFn, setLoginUserIdFn, setUserSessionIdFn } from "./base/message";
import { setUserCommonProperty } from "../models/user_property";
import TrackClientBase from "./base/track_client_base";

/**
 * 核心Api, 实现了EventEmitter, hooker
 * 可监听的事件看变量CLIENT_LIFECYLE_EVENT
 * 可hook的事件看变量CLIENT_HOOK_EVENT
 * 
 * 
 */
export default class TrackClient extends TrackClientBase {

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

  constructor(option?: object) {
    super(option);
  }

  /**
   * 加载插件
   * @param plugin 插件
   * @param option 插件配置
   */
  use(plugin: IBasePlugin, option?: object): void {
    super.use(plugin, option);
  }

  init(option: IOption) {
    super.init(option);
  }

  /**
   * 数据上报
   * @param msg 
   */
  toReport(msg: ICommonMessage) {
    this.reporter.report(msg);
  }

  track(eventName: string, userProps: UserMessage) {
    super.track(eventName, userProps);
  }
}

export function createClient(option?) {
  return new TrackClient(option);
}
