import { CLIENT_HOOK_EVENT, CLIENT_LIFECYLE_EVENT } from "../../config/constant";
import { genSpanId, getParentPageSpanId, getTraceId } from "../../config/global";
import { getUserCommonProperties, setUserCommonProperty } from "../../models/user_property";
import { getBrowserName, getBrowserVersion, getOsInfo } from "../../utils/system";
import { randomString } from "../../utils/tool";

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

export class CommonMessager implements ICommonMessager {
  client: ITrackClient;
  constructor(client: ITrackClient) {
    this.client = client;
  }

  /**
   * 获取通用属性
   * @param eventType 
   * @returns 如果返回Falsy, 则放弃上报
   */
  getCommonMessage(eventType: EventType|APMType): ICommonMessage|Falsy {
    const userCommProp = getUserCommonProperties();
    CommonMessage = {
      ...CommonMessage,
      $event_type: eventType,
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
    const res = this.client.triggerHook(CLIENT_HOOK_EVENT.BEFORE_BUILD, CommonMessage);
    if (res) {
      this.client.emit(CLIENT_LIFECYLE_EVENT.BEFORE_BUILD, res);
    }
    return res;
  }

}
