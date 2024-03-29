/**
 * 点击事件采集数据规则：
 * 1. button/a/input/textarea 自动抓取：向上轮询判断是否是这几个标签，限制最多5个
 * 2. 其他元素可配置抓取
 * 3. div元素, 只抓取叶子节点
 */

import { COLLECT_CUR_OR_UP_ELM_TYPE, MAX_UP_ELM_LEVEL } from "../config/config";
import { AUTO_TRACK_CLICK_ATTR, AUTO_TRACK_CLICK_IGNORE_ATTR, CLICK_EVENT_NAME } from "../config/constant";
import { setClickSpanId } from "../config/global";
import TrackLog from "../plugins/log";
import { getCommonMessage } from "../plugins/message";
import { hookAElClick } from "../plugins/trace";
import { report } from "../reporter";
import { checkIsReport, getElmSelector, on } from "../utils/tool";

export default class ClickEvent {
  // 只初始化一次
  private static isInit: boolean = false;
  // 自动采集数据
  private static isAutoTrack: boolean = true;
  private static clickConfig: IClickEventCapacity;
  static autoTrack(conf: IClickEventCapacity) {
    if (!conf || !conf.enable || ClickEvent.isInit) return;
    ClickEvent.isInit = true;
    ClickEvent.clickConfig = conf;
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

  /**
   * 检查是否需要上报, true-上报
   * @param data 
   * @returns 
   */
   private checkDataReport(data: IClickEventMessage): boolean {
    if (ClickEvent.clickConfig) {
      const {include_pages, exclude_pages} = ClickEvent.clickConfig;
      return checkIsReport(include_pages, exclude_pages, data.$url);
    }
    return false;
  }

  private handleClick(e: Event) {
    if (ClickEvent.isAutoTrack) {
      const data = this.getClickEventMessage(e);

      if (!data || !this.checkDataReport(data)) {
        TrackLog.log('该点击元素不采集', e.target);
        return;
      }

      setClickSpanId(data.$span_id);
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
      $event_type: CLICK_EVENT_NAME,
      $element_type: target.nodeName.toLowerCase(),
      $element_id: target.id,
      $element_name: target.getAttribute('name') || '',
      $element_path: getElmSelector(target),
      $element_content: target.innerHTML,
      $click_type: 'single_click',
      $element_page_x: (e as PointerEvent).pageX,
      $element_page_y: (e as PointerEvent).pageY,
    }
    const {track_attr} = ClickEvent.clickConfig;
    if (track_attr && track_attr.length > 0) {
      track_attr.forEach(k => {
        const value = target.getAttribute(k);
        if (value) {
          data[k] = value;
        }
      })
    }
    return data;
  }

  /**
   * 获取目标元素
   * 1. 元素标识了 data-track-click
   * 2. 元素类型命中了，并且没有设置data-track-click-ignore属性
   * 3. 命中了div元素并且没有设置data-track-click-ignore属性，并且以下条件二选一：a. 叶子节点
   * @param e 
   * @returns 
   */
  private getTargetElement(e: EventTarget): Element|null {
    const {element_types} = ClickEvent.clickConfig;
    if (!(e instanceof Element) || !element_types || element_types.length === 0) {
      return null
    }
    const hit = e.getAttribute(AUTO_TRACK_CLICK_ATTR);
    if (this.checkAttrIsExist(hit)) {
      return e;
    }
    const ignoreAttr = e.getAttribute(AUTO_TRACK_CLICK_IGNORE_ATTR);
    let nodeName = e.nodeName.toLowerCase();
    if (element_types.indexOf(nodeName) !== -1 && nodeName !== 'div' && !this.checkAttrIsExist(ignoreAttr)) {
      return e;
    }
    // 只抓叶子节点
    if (nodeName === 'div' && element_types.indexOf(nodeName) !== -1 && !this.checkAttrIsExist(ignoreAttr) && this.checkDivHit(e)) {
      return e;
    }
    let count = 0;
    let result = e;
    do {
      result = result.parentElement;
      if (!(result instanceof Element)) {
        return null;
      }
      if (this.checkAttrIsExist(result.getAttribute(AUTO_TRACK_CLICK_ATTR))) {
        return result;
      }
      const ignoreAttr2 = result.getAttribute(AUTO_TRACK_CLICK_IGNORE_ATTR);
      const parNodeName = result.nodeName.toLowerCase();
      // div只抓叶子节点
      if (parNodeName === 'div' && element_types.indexOf(parNodeName) !== -1 && !this.checkAttrIsExist(ignoreAttr)) {
        if (this.checkDivHit(result)) {
          return result;
        }
      } else if (element_types.indexOf(parNodeName) !== -1 && COLLECT_CUR_OR_UP_ELM_TYPE[parNodeName] && !this.checkAttrIsExist(ignoreAttr2)) {
        return result;
      }
    } while(count++ < MAX_UP_ELM_LEVEL)
    return null;
  }

  // div只判断叶子节点
  private checkDivHit(e: Element) {
    return e.children.length === 0;
  }

  private checkAttrIsExist(attr: string) {
    return attr !== null && attr !== undefined
  }
}
