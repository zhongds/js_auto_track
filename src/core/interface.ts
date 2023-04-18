/**
 * 插件接口
 */
interface ITrackClient {
  version: string;
  use(plugin: IBasePlugin, option?: object): void;
  beforeReport(fn?): void;
}

interface IPluginManager {
  add(client: ITrackClient, plugin: IBasePlugin, option?: object);
}

interface IBasePlugin {
  name: string;
  setup(client: ITrackClient, option?: object): void;
}

interface IUsePlugin {
  use(plugin: IBasePlugin, option?: any): IBasePlugin;
}

