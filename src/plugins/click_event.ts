/**
 * 点击事件采集数据规则：
 * 1. button/a/input/textarea 自动抓取：向上轮询判断是否是这几个标签
 * 2. 其他元素可配置抓取
 * 3. div元素, 只抓取叶子节点
 */

import { Config } from "../config/config";
import { setClickSpanId } from "../config/global";
import { getCommonMessage } from "../models/message";
import { hookAElClick } from "../models/trace";
import { getElmSelector, on } from "../utils/tool";

const DEF_COLLECT_ELM_TYPE = ['button', 'a', 'input', 'textarea'];

export default class ClickEvent {
  constructor() {
    this.init();
  }

  init() {
    on('click', this.handleClick.bind(this));
    this.hookEventStopPropagation(this.handleClick.bind(this));
  }

  handleClick(e: Event) {
    const data = getClickEventMessage(e);
    report(data);
  }

  /**
   * 重写event.stopPropagation，触发全局的埋点事件
   * @param fn 拦截方法
   */
  hookEventStopPropagation(fn: EventListener): void {
    const originFn = Event.prototype.stopPropagation;
    Event.prototype.stopPropagation = function() {
      fn(this);
      originFn.call(this);
    }
  }

  getClickEventMessage(e: Event): IClickEventMessage|null {
    const target: Element|null = getTargetElement(e.target);
    if (!target) {
      return null;
    }
    const comMsg = getCommonMessage();
    if (target.nodeName.toLowerCase() === 'a') {
      hookAElClick(e, target, comMsg.$span_id);
    }
    const data: IClickEventMessage = {
      ...comMsg,
      $event_type: '$element_click',
      $element_type: target.nodeName.toLowerCase(),
      $element_id: target.id,
      $element_name: target.getAttribute('name'),
      $element_path: getElmSelector(target),
      $element_content: target.innerHTML,
      $click_type: 'single_click',
    }
    setClickSpanId(comMsg.$span_id);
    return data;
  }

  getTargetElement(e: EventTarget): Element|null {
    if (!(e instanceof Element)) {
      return null
    }
    let nodeName = e.nodeName.toLowerCase();
    if (DEF_COLLECT_ELM_TYPE.indexOf(nodeName) !== -1 || (Config.collectClickElmType[nodeName] && nodeName !== 'div')) {
      return e;
    }
    if (nodeName === 'div' && Config.collectClickElmType['div'] && e.children.length === 0) {
      return e;
    }
    let result = e;
    do {
      result = result.parentElement;
    } while(result && DEF_COLLECT_ELM_TYPE.indexOf(result.nodeName.toLowerCase()) === -1)
    return result;
  }

  

}
