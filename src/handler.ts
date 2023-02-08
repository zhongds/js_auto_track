import { getClickEventMessage } from "./plugins/click_event";
import { getPageViewMessage } from "./plugins/page_view";
import { report } from "./reporter";

/**
 * 捕获点击事件
 */
export function handleClick(e: Event) {
  const data = getClickEventMessage(e);
  report(data);
}

export function handlePV() {
  const data = getPageViewMessage();
  report(data);
}

/**
 * 捕获双击事件
 */
export function handleDbClick(e: Event) {
    
}

export function handleResource() {

}

