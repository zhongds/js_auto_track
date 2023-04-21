import { Config, setConfig } from "../../config/config";
import { CLIENT_LIFECYLE_EVENT, USER_DEFINED_EVENT_TYPE } from "../../config/constant";
import RemoteConfig from "../../config/remote_config";
import TrackLog from "../../models/log";
import { checkIsObject } from "../../utils/tool";
import Hooker from "./hooker";
import { CommonMessager } from "./message";
import PluginManager from "./plugin_manager";
import Reporter from "./reporter";
import EventEmitter from "./simp_event_emitter";

export default class TrackClientBase extends EventEmitter implements ITrackClient {
  // 版本信息
  version: string = "{{VERSION}}";
  // 初始化配置：预留配置，暂时没用到
  clientOption: object;
  // 配置信息
  config: IConfig;

  messager: ICommonMessager;
  reporter: IReporter;
  hooker: Hooker;

  pluginManagerIns: IPluginManager;
  constructor(option?: object) {
    super();
    this.messager = new CommonMessager(this);
    this.reporter = new Reporter(this);
    this.hooker = new Hooker();
    this.pluginManagerIns = new PluginManager();
    if (checkIsObject(option)) {
      this.clientOption = option;
    }
  }

  /**
   * 加载插件
   */
  use(plugin: IBasePlugin, option?: object): void {
    this.pluginManagerIns.add(plugin, option);
  }

  init(option: IOption) {
    setConfig(option);
    this.config = Config;
    const configStr = JSON.stringify(this.config);
    if (option.log) {TrackLog.setLevel(option.log)}; // 设置日志级别
    // 初始化事件
    this.emit(CLIENT_LIFECYLE_EVENT.INIT);
    if (option.remoteConfigUrl) {
      RemoteConfig.fetchConfig(option.remoteConfigUrl, () => {
        if (Config.log !== option.log) {TrackLog.setLevel(Config.log)}; // 重置日志级别
        this.config = Config;
        const newConfigStr = JSON.stringify(configStr);
        if (newConfigStr !== configStr) {
          // TODO 上报配置 $RemoteConfigChanged
          this.emit(CLIENT_LIFECYLE_EVENT.REMOTE_CONFIG_CHANGED, JSON.parse(configStr), JSON.parse(newConfigStr));
        }
        this.start();
      })
    } else {
      this.start();
    }
  }

  /**
   * 开启各插件功能
   * @returns 
   */
  start() {
    TrackLog.info("配置====", Config);
    if (!Config.enable) return;

    const arr = this.pluginManagerIns.getAllPlugins();
    if (arr && Array.isArray(arr)) {
      arr.forEach(item => item.plugin.setup(this, item.option));
    }
    this.emit(CLIENT_LIFECYLE_EVENT.START);
  }

  hook(k: string, fn: IHookBeforeReport): void {
    this.hooker.hook(k, fn);
  }

  removeHook(k: string, fn: Function): void {
    this.hooker.removeHook(k, fn);
  }

  triggerHook(k: string, ...args): ICommonMessage|Falsy {
    return this.hooker.triggerHook(k, ...args);
  }

  getCommonMessage(eventType: EventType|APMType): ICommonMessage|Falsy {
    return this.messager.getCommonMessage(eventType);
  }

  /**
   * 数据上报
   * @param msg 
   */
  toReport(msg: ICommonMessage) {
    this.reporter.report(msg);
  }

  track(eventName: string, userProps: UserMessage) {
    if (!eventName || checkIsObject(userProps)) return;
    const msg = this.getCommonMessage(USER_DEFINED_EVENT_TYPE);
    if (!msg) {
      TrackLog.warn('自定义事件被拦截');
      return;
    }
    const data: IUserDefinedEventMessage = {
      ...msg,
      $event_name: eventName,
      $event_type: USER_DEFINED_EVENT_TYPE,
      ...userProps,
    };
    this.toReport(data);
  }
}

