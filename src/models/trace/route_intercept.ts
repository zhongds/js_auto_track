import { URL_TRACE_ID_KEY } from "../../config/constant";
import { getTraceId } from "../../config/global";
import { addSearch2Url } from "../../utils/tool";

const SDK_OPEN_KEY = '@@SDK_OPEN_KEY';
const SDK_HREF_KEY = '@@SDK_HREF_KEY';
const _open = window.open;
const _href = window[SDK_HREF_KEY] = window.location.href;

/**
 * a标签跳转拦截
 * @param target 
 * @returns 
 */
export function hookAElClick(e: Event, target: Element) {
  if (!(target instanceof Element) || target.nodeName.toLowerCase() !== 'a') {
    return null
  }
  e.preventDefault();
  let url = target.getAttribute('href');
  const tag = target.getAttribute('target');

  const traceId = getTraceId();
  if (traceId) {
    url = addSearch2Url(url, URL_TRACE_ID_KEY, traceId);
  }
  _open(url, tag || '_self');
}

/**
 * 全局路由拦截，重写href和window.open方法
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
          url = addSearch2Url(url, URL_TRACE_ID_KEY, traceId);
        } else if (url instanceof URL) {
          url.href = addSearch2Url(url.href, URL_TRACE_ID_KEY, traceId);
        }
      }
      return _open(url, target, features);
    }
  }
}