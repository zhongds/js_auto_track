import { Config, setConfig } from "../config/config";
import { CLIENT_LIFECYLE_EVENT } from "../config/constant";
import RemoteConfig from "../config/remote_config";
import TrackLog from "../plugins/log";
import { checkIsObject } from "../utils/tool";
import EventEmitter from "./SimpEventEmitter";
import PluginManager from "./plugin_manager";
import Reporter from "./reporter";

/**
 * 核心Api, 实现了EventEmitter
 * 可监听的事件有：remote_config_changed, before_report
 * 
 */
export default class TrackClient extends EventEmitter implements ITrackClient {
  // 版本信息
  version: string = "{{VERSION}}";
  // 初始化配置：预留配置，暂时没用到
  clientOption: object;
  // 配置信息
  config: IConfig;

  reporter: IReporter;

  pluginManagerIns: IPluginManager;
  constructor(option?: object) {
    super();
    this.reporter = new Reporter(this);
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
  private start() {
    TrackLog.info("配置====", Config);
    if (!Config.enable) return;

    const arr = this.pluginManagerIns.getAllPlugins();
    if (arr && Array.isArray(arr)) {
      arr.forEach(item => item.plugin.setup(this, item.option));
    }
    this.emit(CLIENT_LIFECYLE_EVENT.START);
  }

  hookBeforeReport(fn: IHookBeforeReport): void {
    
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
