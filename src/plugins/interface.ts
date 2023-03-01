/**
 * 插件接口
 */

interface IBasePlugin {
  setup(): void;
}

interface IUsePlugin {
  use(plugin: IBasePlugin, option?: any): IBasePlugin;
}

