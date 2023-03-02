import { EVENT_MESSAGE_INTERFACE } from "./config/constant";

/**
 * 插件管理
 */
export default class PluginManager {
  
  static interceptors = {
    [EVENT_MESSAGE_INTERFACE]: [] as IEventMessageInterceptorOption[],
  }

  /**
   * 插件管理
   */
  static use(plugin: IBasePlugin, option?) {
    plugin.setup(option);
  }
  

  static registerInterceptor(name: string, option: IEventMessageInterceptorOption) {
    if (name === EVENT_MESSAGE_INTERFACE && option) {
      this.interceptors[name].push(option);
    }
  }

  static interceptEventMessage(msg: ICommonMessage) {
    let props = {};
    this.interceptors[EVENT_MESSAGE_INTERFACE].forEach(v => {
      props = { ...props, ...v.extend_props.entry(msg)};
    });
    return { ...msg, ...props };
  }
}