/**
 * 点击事件采集数据规则：
 * 1. button/a/input/textarea 自动抓取：向上轮询判断是否是这几个标签
 * 2. 其他元素可配置抓取
 * 3. div元素, 只抓取叶子节点
 */

import { Config } from "../config/config";
import { getCommonMessage } from "../config/message";

const DEF_COLLECT_ELM_TYPE = ['button', 'a', 'input', 'textarea'];

/**
 * 
 * @param e 
 * @returns 
 */
export function getClickEventMessage(e: Event): IClickEventMessage|null {
  if (!(e.target instanceof Element)) {
    return null
  }
  const nodeName = e.target.nodeName.toLowerCase();
  if (!Config.collectClickElmType[nodeName] || ) {
    return null;
  }
  const comMsg = getCommonMessage();
  const data: IClickEventMessage = {
    ...comMsg,
    $event_id: '$element_click',
    $element_type: e.target.nodeName.toLowerCase(),
    $element_id: e.target.id,
    $element_name: e.target.getAttribute('name'),
    $element_path: getElmSelector(e.target),
    $element_content: e.target.innerHTML,
    $click_type: 'single_click',
  }
  return data;
}

function getTargetElement(e: Element): Element|null {
  if (!e) {
    return null;
  }
  let nodeName = e.nodeName.toLowerCase();
  if (Config.collectClickElmType[nodeName] && nodeName !== 'div') {
    return e;
  }
  if (nodeName === 'div' && Config.collectClickElmType.div && e.children.length === 0) {
    return e;
  }
  let result: Element|null = null;
  do {
    result = e.parentNode;
  } while(result && DEF_COLLECT_ELM_TYPE.indexOf(result.nodeName.toLowerCase()) === -1)
  return result;
}

/**
 * div只抓取叶子节点
 * @param e 目标元素
 * @returns 
 */
function checkDiv(e: Element): boolean {
  const nodeName = e.nodeName.toLowerCase();
  if (nodeName === 'div' && e.children.length === 0) {
    return true;
  }
  return false
}