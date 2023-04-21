import TrackLog from "../../models/log";

/**
 * 全局插件管理, 基于实例
 */
export default class PluginManager {
  plugins = {}; // name为key, value为IPluginItem

  add(plugin: IBasePlugin, option?: object) {
    if (!this.checkIsPlugin(plugin)) {
      TrackLog.error('plugin is not valid, name: ', ((plugin as any) || {}).name);
      return;
    }
    if (this.plugins[plugin.name]) {
      TrackLog.error('plugin is existed, name: ', plugin.name);
      return;
    }
    const item: IPluginItem = {
      plugin,
      option,
    }
    this.plugins[plugin.name] = item;
  }

  remove(name: string): void {
    if (name && this.plugins[name]) {
      delete this.plugins[name];
    }
  }

  getAllPlugins(): IPluginItem[] {
    const values = Object.keys(this.plugins).map(k => this.plugins[k]);
    return values || [];
  }

  private checkIsPlugin(item: any): item is IBasePlugin {
    return 'name' in item && 'setup' in item;
  }
}
