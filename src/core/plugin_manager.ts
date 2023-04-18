/**
 * 全局插件管理, 基于实例
 */
class PluginManager {
  plugins = [];

  add(client: ITrackClient, plugin: IBasePlugin, option?: object) {
    if (this.checkIsPlugin(plugin)) {
      plugin.setup(client, option);
      // this.plugins.push(plugin);
    }
  }

  beforeReport() {
    
  }


  checkIsPlugin(item: any): item is IBasePlugin {
    return 'name' in item && 'setup' in item;
  }
}
