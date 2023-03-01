import { Config } from "./config/config";
import md5 from 'md5';
import { getGlobalCache } from "./config/global";
import { genScreenshot } from "./models/screenshot";
import TrackLog from "./models/log";

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

  if (data.$event_type === '$page_view' || data.$event_type === '$element_click') {
    genScreenshot(data.$span_id, document.body);
  }
  
  if (false && window.navigator && "function" == typeof window.navigator.sendBeacon ) {
    window.navigator.sendBeacon(Config.reportUrl, JSON.stringify(data))
  } else {
    const url = _createUrl(data);
    sendImg(url, function () {
      
    }, function () {
      
    })
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

function sendImg(src, successCallback, errorCallback) {
  const img = new Image();
  img.onload = successCallback;
  img.onerror = errorCallback;
  img.src = src;
}

const version = '1.0.0';

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

  const {appId, secret, reportUrl} = Config;

  value = 'appId=' + appId + 'log=' + param + 'v=' + version;

  sig = md5(value + secret);

  query = 'appId=' + appId + '&log=' + encodeURIComponent(param) + '&v=' + version + '&sig=' + sig;

  return reportUrl + '?' + query; 
}
