/**
 * 管理全局变量
 */
import { MemoryCache } from '../models/cache';
import {generateSpanId, generateTraceId} from '../models/trace/generator';
import { getSearchKV } from '../utils/tool';
import { URL_TRACE_ID_KEY } from './constant';

// 1. 先从从url 获取trace_id 2. 获取不到再生成
function getTraceFromUrlOrGen() {
  let traceId = getSearchKV(location.href, URL_TRACE_ID_KEY);
  if (!traceId) {
    traceId = generateTraceId();
  }
  return traceId;
}

const traceId = getTraceFromUrlOrGen();
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
  cache: {} as MemoryCache,
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
  if (pageSpanId.value && clickSpanId.value) {
    return pageSpanId.timestamp > clickSpanId.timestamp ? pageSpanId.value : clickSpanId.value;
  }
  return pageSpanId.value;
}