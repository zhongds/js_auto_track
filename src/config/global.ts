/**
 * 管理全局变量
 */
import { MemoryCache } from '../core/base/cache';
import {generateSpanId, generateTraceId} from '../plugins/trace/generator';
import { getSearchKV } from '../utils/tool';
import { URL_SPAN_ID_KEY, URL_TRACE_ID_KEY } from './constant';

/**
 * 全局变量
 */
 const GlobalVar = {
  traceId: '',
  pageSpanId: {
    value: '',
    timestamp: 0, // 时间戳
  },
  clickSpanId: {
    value: '',
    timestamp: 0,
  },
  cache: {} as MemoryCache,
  isReport: false,
  pageLoadendTime: 0, // 当前页面加载完成时间，用来计算页面停留时长
}

// 1. 先从从url 获取trace_id和spanId 2. 获取不到再生成
function getTraceIdFromUrlOrGen() {
  let traceId = getSearchKV(location.href, URL_TRACE_ID_KEY);
  if (!traceId && document.referrer) {
    traceId = getSearchKV(document.referrer, URL_TRACE_ID_KEY)
  }
  return traceId || generateTraceId();
}

function getSpanIdFromUrl() {
  let spanId = getSearchKV(location.href, URL_SPAN_ID_KEY);
  if (!spanId && document.referrer) {
    spanId = getSearchKV(document.referrer, URL_SPAN_ID_KEY);
  }
  return spanId;
}

const urlTraceId = getTraceIdFromUrlOrGen();
GlobalVar.traceId = urlTraceId;
const urlSpanId = getSpanIdFromUrl();
if (urlSpanId) {
  setPageSpanId(urlSpanId);
}

export function getGlobalCache() {
  return GlobalVar.cache;
}

export function setGlobalCache(cache: MemoryCache) {
  if (cache) {
    GlobalVar.cache = cache;
  }
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
  if (clickSpanId.value) {
    return pageSpanId ? (pageSpanId.timestamp > clickSpanId.timestamp ? pageSpanId.value : clickSpanId.value) : clickSpanId.value;
  }
  return pageSpanId.value;
}

export function setPageLoadendTime(time: number) {
  if (typeof time === 'number' && time > 0) {
    GlobalVar.pageLoadendTime = time;
  }
}

export function getPageLoadendTime(): number {
  return GlobalVar.pageLoadendTime;
}
