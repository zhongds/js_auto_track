import { checkIsObject } from "../utils/tool";

/**
 * 核心Api
 */
export default class TrackClient implements ITrackClient {
  // 版本信息
  version: string = "{{VERSION}}";
  // 初始化配置
  clientOption: object;

  pluginManagerIns: IPluginManager;
  constructor(option?: object) {
    this.pluginManagerIns = new PluginManager();
    if (checkIsObject(option)) {
      this.clientOption = option;
    }
  }

  /**
   * 加载插件
   */
  use(plugin: IBasePlugin, option?: object): void {
    this.pluginManagerIns.add(this, plugin);
  }

  /**
   * 上报之前
   */
  beforeReport(msg) {
    
  }



  private checkPluginValid() {

  }
}

export function createClient(option?) {
  return new TrackClient(option);
}
