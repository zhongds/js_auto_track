import { genSpanId, getPageSpanId, getParentPageSpanId, getTraceId } from "../config/global";
import { getUserCommonProperties, setUserCommonProperty } from "../models/user_property";
import { getBrowserName, getBrowserVersion, getOsInfo } from "../utils/system";
import { randomString } from "../utils/tool";
import TrackLog from "./log";

const SDK_ANONYMOUS_ID_TAG = '$track_sdk_anonymous_id';

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
  $charset: document.charset || document.characterSet,
} as ICommonMessage;

// 设置userId
export function setLoginUserIdFn(fn: UserPropertyType) {
  setUserCommonProperty('$user_id', fn);
}
// 设置用户的sessionId
export function setUserSessionIdFn(fn: UserPropertyType) {
  setUserCommonProperty('$user_session_id', fn);
}
// 设置deviceId
export function setDeviceIdFn(fn: UserPropertyType) {
  setUserCommonProperty('$device_id', fn);
}
// 设置guid
export function setGuidFn(fn: UserPropertyType) {
  setUserCommonProperty('$guid', fn);
}

export function getCommonMessage(): ICommonMessage {
  const userCommProp = getUserCommonProperties();
  CommonMessage = {
    ...CommonMessage,
    $page_id: location.href,
    $url: location.href,
    $domain: location.host,
    $referrer: document.referrer,
    $title: document.title,
    $time: Date.now(),
    $trace_id: getTraceId(),
    $span_id: genSpanId(),
    $parent_span_id: getParentPageSpanId(),
    ...userCommProp,
  }
  return CommonMessage;
}
