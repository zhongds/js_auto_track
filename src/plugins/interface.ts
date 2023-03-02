/**
 * 插件接口
 */

interface IBasePlugin {
  name: string;
  setup(option?): void;
}

interface IUsePlugin {
  use(plugin: IBasePlugin, option?: any): IBasePlugin;
}

