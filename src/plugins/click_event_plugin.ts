/**
 * 点击事件采集数据规则：
 * 1. button/a/input/textarea 自动抓取：向上轮询判断是否是这几个标签，限制最多5个
 * 2. 其他元素可配置抓取
 * 3. div元素, 只抓取叶子节点
 */

import { COLLECT_CUR_OR_UP_ELM_TYPE, MAX_UP_ELM_LEVEL } from "../config/config";
import { AUTO_TRACK_CLICK_ATTR, AUTO_TRACK_CLICK_IGNORE_ATTR, CLICK_EVENT_TYPE } from "../config/constant";
import { setClickSpanId } from "../config/global";
import TrackLog from "../models/log";
import { hookAElClick } from "../models/trace";
import { checkIsReport, getElmSelector, on } from "../utils/tool";
import BasePlugin from "./base_plugin";

class ClickEventPlugin extends BasePlugin {
  // 自动采集数据
  private isAutoTrack: boolean = true;
  private clickConfig: IClickEventCapacity;
  autoTrack(client: ITrackClient, conf: IClickEventCapacity) {
    if (super.setup(client, conf)) {
      if (!conf || !conf.enable) return false;
      this.clickConfig = conf;
      this.init();
      }
    return true;
  }

  /**
   * 
   */
  destroy() {
    super.destroy();
    this.isAutoTrack = false;
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
    if (this.clickConfig) {
      const {include_pages, exclude_pages} = this.clickConfig;
      return checkIsReport(include_pages, exclude_pages, data.$url);
    }
    return false;
  }

  private handleClick(e: Event) {
    if (!this.isAutoTrack || !this.client) return;
    const data = this.getClickEventMessage(e);

    if (!data || !this.checkDataReport(data)) {
      TrackLog.log('该点击元素不采集', e.target);
      return;
    }

    setClickSpanId(data.$span_id);
    this.client.toReport(data);
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

  private getClickEventMessage(e: Event): IClickEventMessage|Falsy {
    const target: Element|null = this.getTargetElement(e.target);
    if (!target) {
      return null;
    }
    const comMsg = this.client.getCommonMessage(CLICK_EVENT_TYPE);
    if (!comMsg) return null;
    if (target.nodeName.toLowerCase() === 'a') {
      hookAElClick(e, target, comMsg.$span_id);
    }
    const data: IClickEventMessage = {
      ...comMsg,
      $element_type: target.nodeName.toLowerCase(),
      $element_id: target.id,
      $element_name: target.getAttribute('name') || '',
      $element_path: getElmSelector(target),
      $element_content: target.innerHTML,
      $click_type: 'single_click',
      $element_page_x: (e as PointerEvent).pageX,
      $element_page_y: (e as PointerEvent).pageY,
    }
    const {track_attr} = this.clickConfig;
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
    const {element_types} = this.clickConfig;
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

export default new ClickEventPlugin();
