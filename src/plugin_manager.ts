import { EVENT_MESSAGE_INTERCEPTOR } from "./config/constant";

/**
 * 插件管理
 */
export default class PluginManager {
  
  static interceptors = {
    [EVENT_MESSAGE_INTERCEPTOR]: [] as IEventMessageInterceptorOption[],
  }

  /**
   * 插件管理
   */
  static use(plugin: IBasePlugin, option?) {
    plugin.setup(option);
  }
  

  static registerInterceptor(name: string, option: IEventMessageInterceptorOption) {
    if (name === EVENT_MESSAGE_INTERCEPTOR && option) {
      this.interceptors[name].push(option);
    }
  }

  static interceptEventMessage(msg: ICommonMessage) {
    let props = {};
    this.interceptors[EVENT_MESSAGE_INTERCEPTOR].forEach(v => {
      props = { ...props, ...v.extend_props.entry(msg)};
    });
    return { ...msg, ...props };
  }
}