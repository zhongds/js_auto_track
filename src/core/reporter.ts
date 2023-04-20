import { Config } from "../config/config";
import md5 from 'md5';
import { getGlobalCache } from "../config/global";
import { genScreenshot } from "../plugins/screenshot";
import TrackLog from "../plugins/log";
import { CLICK_EVENT_NAME, PV_EVENT_NAME } from "../config/constant";
import PluginManager from "../plugin_manager";
import {gzip} from 'pako';

const ReportDataRetryKey = '$track_sdk_report_data_retry'; // 重试
export function report(data: ICommonMessage) {
  TrackLog.log('上报数据: ', data);
  if (!data) {
    return;
  }
  // 避免错误重复上报
  if (cacheIntercept(data)) {
    TrackLog.log('cache, not report ');
    return;
  }

  if (data.$event_type === PV_EVENT_NAME || data.$event_type === CLICK_EVENT_NAME) {
    genScreenshot(data.$span_id, document.body);
  }

  // 做一层拦截
  data = PluginManager.interceptEventMessage(data);
  
  if (false && window.navigator && "function" == typeof window.navigator.sendBeacon) {
    window.navigator.sendBeacon(Config.reportUrl, JSON.stringify(data))
  } else {
    const url = _createUrl(data);
    sendImg(url)
  }
}

function cacheUrl2Local(url: string) {
  try {
    const arrStr = localStorage.getItem(ReportDataRetryKey);
    const arr = arrStr ? JSON.parse(arrStr) : [];
    arr.push(url);
    localStorage.setItem(ReportDataRetryKey, JSON.stringify(arr));
  } catch(err) {
    TrackLog.error('report url cache to localStorage error:', err);
  }
}

function reportLocalData() {
  try {
    const arrStr = localStorage.getItem(ReportDataRetryKey);
    const arr = JSON.parse(arrStr);
    // TODO
    arr.forEach(v => sendImg(v));
  } catch(err) {
    TrackLog.error('get report url from localStorage error:', err);
  }
}

/**
 * 缓存管理，降低重复数据上报的频率
 */
const impactKeys = ['$time']; //影响因子
function cacheIntercept(data: ICommonMessage) {
  const cloneData = {...data};
  const cache = getGlobalCache();
  if (cache) {
    impactKeys.forEach((k => delete cloneData[k]));
    const key = JSON.stringify(cloneData);
    if (cache.get(key)) {
      TrackLog.log('命中缓存，不上报');
      return true;
    }
    cache.set(key, 1);
  }
  return false;
}

function sendImg(src, successCallback?, errorCallback?) {
  const img = new Image();
  img.src = src;
}

const version = '{{VERSION}}';

var _createUrl = function (queue) {
  var param;
  var query;
  var value; // 用于计算签名
  var sig;

  if (typeof queue === "object" && Array.isArray(queue)) {
    param = {
      il: queue
    };
  } else {
    param = queue;
  }

  param = JSON.stringify(param);

  let addGzip = '';
  if (typeof btoa === 'function') {
    param = genCompressData(param);
    addGzip = '&gzip=1';
  }
  
  const {appId, secret, reportUrl} = Config;
  value = 'appId=' + appId + 'log=' + param + 'v=' + version;

  sig = md5(value + secret);

  query = 'appId=' + appId + '&log=' + encodeURIComponent(param) + '&v=' + version + '&sig=' + sig + addGzip;

  return reportUrl + '?' + query; 
}

function genCompressData(msg: string) {
  // Next, convert the string to a Uint8Array
  const stringAsUint8Array = new TextEncoder().encode(msg);
  // Finally, gzip the Uint8Array using pako
  const compressedData = gzip(stringAsUint8Array);
  // You can convert the compressed data to a string if needed
  const compressedString = new TextDecoder().decode(compressedData);
  // Convert compressed data to a base64-encoded string
  const base64Data = btoa(String.fromCharCode.apply(null, compressedData));
  
  return base64Data;
}
