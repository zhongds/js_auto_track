import { EVENT_MESSAGE_INTERCEPTOR, PV_EVENT_NAME } from "../config/constant";
import { transUserCommonProperties } from "../models/user_property";
import PluginManager from "../plugin_manager";
import { checkIsObject } from "../utils/tool";

export interface IInjectConfig {
  events: Array<EventType|APMType>;
  properties: {
    [key: string]: UserPropertyType;
  }
}

export type DynamicInjectFn = (msg: ICommonMessage) => UserMessage;

/**
 * 注入自定义属性（静态属性和动态属性）
 */
class InjectProperty implements IBasePlugin {

  // 用户自定义事件属性
  static properties = [];

  name = 'inject-event-property';
  
  // 插件use的时候会调用setup
  setup(): void {
    const _this = this;
    PluginManager.registerInterceptor(EVENT_MESSAGE_INTERCEPTOR, {
      extend_props: {
        entry(msg: ICommonMessage) {
          return _this.addProperty(msg);
        },
      }
    } as IEventMessageInterceptorOption)
  }

  /**
   * 静态注入
   * @param injConf 
   * @returns 
   */
  inject(injConf: IInjectConfig): void {
    if (!injConf || !injConf.events || injConf.events.length === 0 || !injConf.properties) return;
    InjectProperty.properties.push(injConf);
  }

  /**
   * 返回的结果会跟原有的数据合并上报
   * @param fn 方法，结果返回新增的数据结构
   */
  hook(fn: DynamicInjectFn): void {
    if (typeof fn === 'function') {
      InjectProperty.properties.push(fn);
    }
  }

  private addProperty(msg: ICommonMessage): UserMessage {
    const result = {};
    InjectProperty.properties.forEach(f => {
      if (checkIsObject(f)) {
        const {events=[], properties={}} = f as IInjectConfig;
        if (events.indexOf(msg.$event_type) > -1) {
          const pureProps = transUserCommonProperties(properties);
          result = { ...result, ...pureProps };
        }
      } else if (typeof f === 'function') {
        const res = f.call(null, msg);
        if (checkIsObject(res)) {
          result = { ...result, ...res };
        }
      }
    });
    return result;
  }
}

export default new InjectProperty();

