/**
 * 点击事件采集数据规则：
 * 1. button/a/input/textarea 自动抓取：向上轮询判断是否是这几个标签
 * 2. 其他元素可配置抓取
 * 3. div元素, 只抓取叶子节点
 */

import { COLLECT_CUR_OR_UP_ELM_TYPE, Config } from "../config/config";
import { setClickSpanId } from "../config/global";
import { getCommonMessage } from "../models/message";
import { hookAElClick } from "../models/trace";
import { report } from "../reporter";
import { getElmSelector, on } from "../utils/tool";

export default class ClickEvent {
  // 只初始化一次
  private static isInit: boolean = false;
  // 自动采集数据
  private static isAutoTrack: boolean = true;
  static autoTrack() {
    if (ClickEvent.isInit) return;
    ClickEvent.isInit = true;
    const ins = new ClickEvent();
    ins.init();
  }

  /**
   * 不收集收据了（重写的方法不恢复原来的，以防其他库再次重写了方法被我们覆盖了）
   */
  static stopTrack() {
    ClickEvent.isAutoTrack = false;
  }

  static resumeTrack() {
    ClickEvent.isAutoTrack = true;
  }

  private init() {
    on('click', this.handleClick.bind(this));
    this.hookEventStopPropagation(this.handleClick.bind(this));
  }

  private handleClick(e: Event) {
    if (ClickEvent.isAutoTrack) {
      const data = this.getClickEventMessage(e);
      report(data);
    }
  }

  /**
   * 重写event.stopPropagation，触发全局的埋点事件
   * @param fn 拦截方法
   */
  private hookEventStopPropagation(fn: EventListener): void {
    const originFn = Event.prototype.stopPropagation;
    Event.prototype.stopPropagation = function() {
      fn(this);
      originFn.call(this);
    }
  }

  private getClickEventMessage(e: Event): IClickEventMessage|null {
    const target: Element|null = this.getTargetElement(e.target);
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
      $element_page_x: (e as PointerEvent).pageX,
      $element_page_y: (e as PointerEvent).pageY,
    }
    setClickSpanId(comMsg.$span_id);
    return data;
  }

  private getTargetElement(e: EventTarget): Element|null {
    if (!(e instanceof Element)) {
      return null
    }
    let nodeName = e.nodeName.toLowerCase();
    if (Config.collectClickElmType[nodeName] && nodeName !== 'div') {
      return e;
    }
    if (nodeName === 'div' && Config.collectClickElmType['div'] && e.children.length === 0) {
      return e;
    }
    const keys = Object.keys(COLLECT_CUR_OR_UP_ELM_TYPE).reduce((res, cur) => {
      if (COLLECT_CUR_OR_UP_ELM_TYPE[cur]) {
        res.push(cur);
      }
      return res;
    }, []);
    let result = e;
    do {
      result = result.parentElement;
    } while(result && keys.indexOf(result.nodeName.toLowerCase()) === -1)
    return result;
  }
}
