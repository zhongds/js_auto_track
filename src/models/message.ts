import { genSpanId, getPageSpanId, getParentPageSpanId, getTraceId } from "../config/global";
import { getBrowserName, getBrowserVersion, getOsInfo } from "../utils/system";
import { randomString } from "../utils/tool";

const SDK_ANONYMOUS_ID_TAG = '$sdk_anonymous_id';

function getAnonymousId() {
  let anonId = localStorage.getItem(SDK_ANONYMOUS_ID_TAG);
  if (!anonId) {
    anonId = randomString();
    localStorage.setItem(SDK_ANONYMOUS_ID_TAG, anonId);
  }
  return anonId;
}

const osInfo = getOsInfo();
let CommonMessage = {
  $event_type: '',
  $time: Date.now(),
  $anonymous_id: getAnonymousId(),
  $session_id: randomString(),
  $user_session_id: '',
  $sdk_type: 'js',
  $sdk_version: '{{VERSION}}', // 构建时替换
  $os: osInfo.name, 
  $os_version: osInfo.version,
  $os_language: navigator.language,
  $network_carrier: '', // 网络运营商
  $network_type: navigator.connection && navigator.connection.effectiveType,
  $user_agent: navigator.userAgent,
  $browser: getBrowserName(),
  $browser_version: getBrowserVersion(),
  $screen_height: window.screen.height || window.outerHeight,
  $screen_width: window.screen.width || window.outerWidth,
  $viewpoint_height: window.innerHeight,
  $viewpoint_width: window.innerWidth,
  $page_id: location.href,
  $url: location.href,
  $domain: location.host,
  $referrer: document.referrer,
  $title: document.title,
  $charset: document.charset || document.characterSet,
} as ICommonMessage;

/**
 * 保存延迟获取的方法
 */
const Runnable = {
  loginUserIdFn: null,
  deviceIdFn: null,
  userSessionIdFn: null,
} as any;
export function setLoginUserIdFn(fn: Function) {
  if (fn && typeof fn === 'function') {
    Runnable.loginUserIdFn = fn;
  }
}

export function setDeviceIdFn(fn: Function) {
  if (fn && typeof fn === 'function') {
    Runnable.deviceIdFn = fn;
  }
}

export function setUserSessionIdFn(fn: Function) {
  if (fn && typeof fn === 'function') {
    Runnable.userSessionIdFn = fn;
  }
}

function run(fn: Function): string {
  try {
    if (fn && typeof fn === 'function') {
      const args = 1 === arguments.length ? [arguments[0]] : Array.apply(null, arguments);
      const result = fn.apply(null, args);
      return typeof result === 'string' ? result : '';
    }
  } catch (error) {
    console.error('error:::', error);
  }
  return '';
}


export function getCommonMessage(): ICommonMessage {
  CommonMessage = {
    ...CommonMessage,
    $time: Date.now(),
    $trace_id: getTraceId(),
    $span_id: genSpanId(),
    $parent_span_id: getParentPageSpanId(),
    $user_id: run(Runnable.loginUserIdFn),
    $user_session_id: run(Runnable.userSessionIdFn),
    $device_id: run(Runnable.deviceIdFn)
  }
  return CommonMessage;
}
