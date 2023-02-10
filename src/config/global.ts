/**
 * 管理全局变量
 */
import {generateSpanId, generateTraceId} from './trace';

const traceId = generateTraceId();
/**
 * 全局变量
 */
const GlobalVar = {
  traceId: traceId,
  pageSpanId: {
    value: '',
    timestamp: 0, // 时间戳
  },
  clickSpanId: {
    value: '',
    timestamp: 0,
  },
}

export function getTraceId() {
  return GlobalVar.traceId;
}

export function setPageSpanId(value: string) {
  GlobalVar.pageSpanId.value = value;
  GlobalVar.pageSpanId.timestamp = Date.now();
}

export function getPageSpanId() {
  return GlobalVar.pageSpanId.value;
}

export function setClickSpanId(value: string) {
  GlobalVar.clickSpanId.value = value;
  GlobalVar.clickSpanId.timestamp = Date.now();
}

export function getClickSpanId() {
  return GlobalVar.clickSpanId.value;
}

export function genSpanId() {
  return generateSpanId();
}

/**
 * 获取parent pageSpanId
 * @returns string
 */
export function getParentPageSpanId(): string {
  const {pageSpanId, clickSpanId} = GlobalVar;
  if (pageSpanId.value && clickSpanId.value) {
    return pageSpanId.timestamp > clickSpanId.timestamp ? pageSpanId.value : clickSpanId.value;
  }
  return pageSpanId.value;
}