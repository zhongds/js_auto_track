import { getClickEventMessage, getCommonMessage } from "./config/message";
import { report } from "./reporter";

/**
 * 捕获点击事件
 */
export function handleClick(e: Event) {
  const data = getClickEventMessage(e);
  report(data);
}

/**
 * 捕获点击事件
 */
export function handleDbClick(e: Event) {
  
}



export function handlePV(e: Event) {
  
}

