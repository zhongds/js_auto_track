/**
 * 插件接口
 */

interface IBasePlugin {
  setup(option?): void;
}

interface IUsePlugin {
  use(plugin: IBasePlugin, option?: any): IBasePlugin;
}

