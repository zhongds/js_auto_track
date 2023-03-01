import { PV_EVENT_NAME } from "../config/constant";

interface IInjectConfig {
  events: Array<EventType|APMType>;
  properties: {
    [key: string]: UserPropertyType;
  }
}

type DynamicInjectFn = (msg: ICommonMessage) => {[key: string]: string|boolean|number|object};

/**
 * 注入自定义属性（静态属性和动态属性）
 */
export default class InjectProperty implements IBasePlugin {

  // 用户自定义事件属性
  static eventUserProp: any = {};
  static dynamicUserInjectFnArr = [];
  
  // use的时候会调用setup，把数据清空
  setup(): void {
    InjectProperty.eventUserProp = {};
  }

  /**
   * 静态注入
   * @param injConf 
   * @returns 
   */
  inject(injConf: IInjectConfig): void {
    if (!injConf || !injConf.events || injConf.events.length === 0 || !injConf.properties) return;
    const {events, properties} = injConf;
    for (const i in events) {
      InjectProperty.eventUserProp[events[i]] = { ...InjectProperty.eventUserProp[events[i]], ...properties };
    }
  }

  /**
   * 动态注入
   * @param fn 
   */
  dynamicInject(fn: DynamicInjectFn) {
    if (typeof fn === 'function') {
      InjectProperty.dynamicUserInjectFnArr.push(fn);
    }
  }
}

