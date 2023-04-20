import TrackClientBase from "./base/track_client_base";

/**
 * 核心Api, 实现了EventEmitter
 * 可监听的事件有：remote_config_changed, before_report
 * 
 */
export default class TrackClient extends TrackClientBase {

  constructor(option?: object) {
    super(option);
  }

  /**
   * 加载插件
   */
  use(plugin: IBasePlugin, option?: object): void {
    super.use(plugin, option);
  }

  init(option: IOption) {
    super.init(option);
  }

  hookBeforeReport(fn: IHookBeforeReport): void {
    super.hookBeforeReport(fn);
  }

  triggerHook(k: string, ...args): ICommonMessage|null|undefined|false {
    return super.triggerHook(k, ...args);
  }



  /**
   * 数据上报
   * @param msg 
   */
  toReport(msg: ICommonMessage) {
    this.reporter.report(msg);
  }
}

export function createClient(option?) {
  return new TrackClient(option);
}
