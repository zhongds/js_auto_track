import { Config, setConfig } from "../config/config";
import TrackLog from "../plugins/log";
import { checkIsObject } from "../utils/tool";

/**
 * 核心Api
 */
export default class TrackClient implements ITrackClient {
  // 版本信息
  version: string = "{{VERSION}}";
  // 初始化配置
  clientOption: IConfig;

  pluginManagerIns: IPluginManager;
  constructor(option?: IConfig) {
    this.pluginManagerIns = new PluginManager();
    if (checkIsObject(option)) {
      this.clientOption = option;
    }
  }

  init(option: IOption) {
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

  /**
   * 开启各插件功能
   * @returns 
   */
  private start() {
    TrackLog.info("配置====", Config);
    if (!Config.enable) return;

    // setGlobalCache(new MemoryCache());
    // new RouteIntercept(); 
    // Config.pv && PageViewPerf.autoTrack(Config.pv); // done
    // Config.click && ClickEvent.autoTrack(Config.click); // done
    // Config.res && this.sendResource(); // TODO
    // Config.error && WrapError.autoTrack(Config.error); // done
    // Config.api && ApiPerf.autoTrack(Config.api);  // done
    // Config.page_leave && PageLeave.autoTrack(Config.page_leave); // done
  }

  /**
   * 加载插件
   */
  use(plugin: IBasePlugin, option?: object): void {
    this.pluginManagerIns.add(this, plugin);
  }

  onConfigChange() {
    
  }

  /**
   * 上报之前
   */
  beforeReport(msg) {
    
  }

  /**
   * 数据上报
   * @param msg 
   */
  toReport(msg) {

  }
}

export function createClient(option?) {
  return new TrackClient(option);
}
