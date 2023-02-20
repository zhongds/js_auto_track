import { Config } from "../../config/config";
import { URL_SPAN_ID_KEY, URL_TRACE_ID_KEY } from "../../config/constant";
import { getTraceId } from "../../config/global";
import { addSearch2Url, checkIsSameDomain } from "../../utils/tool";

const SDK_OPEN_KEY = '@@SDK_OPEN_KEY';
const SDK_HREF_KEY = '@@SDK_HREF_KEY';
const _open = window.open;
const _href = window[SDK_HREF_KEY] = window.location.href;

/**
 * a标签跳转拦截
 * @param target 
 * @returns 
 */
export function hookAElClick(e: Event, target: Element, spanId: string) {
  if (!(target instanceof Element) || target.nodeName.toLowerCase() !== 'a') {
    return null
  }
  let url = target.getAttribute('href');
  const reg = /^(ftp:\/\/|mailto:|file:|javascript:).*/;
  if (reg.test(url)) {
    return;
  }
  const tag = target.getAttribute('target');

  const traceId = getTraceId();
  let newUrl = url;
  if (traceId) {
    newUrl = checkAndAddSearch2Url(url, URL_TRACE_ID_KEY, traceId);
    newUrl = checkAndAddSearch2Url(newUrl, URL_SPAN_ID_KEY, spanId);
  }
  if (newUrl !== url) { // 地址没变就走原来的逻辑
    e.preventDefault();
    _open(newUrl, tag || '_self');
  }
}

/**
 * 全局路由拦截，重写href和window.open方法
 * 添加traceId和spanId
 */
export class RouteIntercept {
  static isInit: boolean = false;
  constructor() {
    if (!RouteIntercept.isInit) {
      RouteIntercept.isInit = true;
      this.hookLocationHref();
      this.hookWindowOpen();
    }
  }
  
  hookLocationHref() {

  }
  
  hookWindowOpen() {
    window.open = function (url?: string | URL, target?: string, features?: string) {
      const traceId = getTraceId();
      if (traceId) {
        if (typeof url === 'string') {
          url = checkAndAddSearch2Url(url, URL_TRACE_ID_KEY, traceId);
        } else if (url instanceof URL) {
          url.href = checkAndAddSearch2Url(url.href, URL_TRACE_ID_KEY, traceId);
        }
      }
      return _open(url, target, features);
    }
  }
}

/**
 * 单页应用并且跳转是同域的话就不需要加traceId
 * @param url 
 * @param key 
 * @param value 
 * @returns 
 */
function checkAndAddSearch2Url(url: string, key: string, value: string): string {
  if (Config.enableSPA && checkIsSameDomain(url)) {
    return url;
  }
  return addSearch2Url(url, key, value);
}