/**
 * 管理全局变量
 */

import { randomString } from "../utils/tool";

const ranId = randomString();
/**
 * 全局变量
 */
const GlobalVar = {
  traceId: ranId,
  pageSpanId: '',
  clickSpanId: '',
}

export function getTraceId() {
  return GlobalVar.traceId;
}

export function setPageSpanId(value: string) {
  GlobalVar.pageSpanId = value;
}

export function getPageSpanId() {
  return GlobalVar.pageSpanId
}

export function setClickSpanId(value: string) {
  GlobalVar.clickSpanId = value;
}

export function getClickSpanId() {
  return GlobalVar.clickSpanId;
}

export function genSpanId() {
  return randomString();
}
