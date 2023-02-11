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
let CommonMessage: ICommonMessage = {
  $event_id: '',
  $time: Date.now(),
  $anonymous_id: getAnonymousId(),
  $session_id: randomString(),
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
}

export function setAppId(appId: string) {
  CommonMessage.$app_id = appId;
}

export function setChannelId(channelId: string) {
  CommonMessage.$channel_id = channelId;
}

export function setLoginUserId(uid: string) {
  CommonMessage.$user_id = uid;
}

export function setDeviceId(deviceId: string) {
  CommonMessage.$device_id = deviceId;
}

export function setGuid(guid: string) {
  CommonMessage.$guid = guid;
}

export function getCommonMessage(): ICommonMessage {
  CommonMessage = {
    ...CommonMessage,
    $time: Date.now(),
  }
  return CommonMessage;
}
