/**
 * 点击事件采集数据规则：
 * 1. button/a/input/textarea 自动抓取：向上轮询判断是否是这几个标签
 * 2. 其他元素可配置抓取
 * 3. div元素, 只抓取叶子节点
 */

import { Config } from "../config/config";
import { genSpanId, getPageSpanId, getTraceId, setClickSpanId } from "../config/global";
import { getCommonMessage } from "../config/message";
import { getElmSelector } from "../utils/tool";

const DEF_COLLECT_ELM_TYPE = ['button', 'a', 'input', 'textarea'];

/**
 * 生成点击事件信息
 * @param e 
 * @returns 
 */
export function getClickEventMessage(e: Event): IClickEventMessage|null {
  const target: Element|null = getTargetElement(e.target);
  if (!target) {
    return null;
  }
  const spanId = genSpanId();
  const comMsg = getCommonMessage();
  const data: IClickEventMessage = {
    ...comMsg,
    $event_id: '$element_click',
    $trace_id: getTraceId(),
    $span_id: spanId,
    $parent_span_id: getPageSpanId(),
    $element_type: target.nodeName.toLowerCase(),
    $element_id: target.id,
    $element_name: target.getAttribute('name'),
    $element_path: getElmSelector(target),
    $element_content: target.innerHTML,
    $click_type: 'single_click',
  }
  setClickSpanId(spanId);
  return data;
}

/**
 * 根据规则，找出目标元素
 * @param e 
 * @returns 
 */
function getTargetElement(e: EventTarget): Element|null {
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
