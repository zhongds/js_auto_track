import { Config } from "./config/config";
import { warn } from "./utils/tool";
import md5 from 'md5';
import { getGlobalCache } from "./config/global";

export function report(data: ICommonMessage) {
  console.log('上报数据: ', data);
  if (!data) {
    return;
  }
  if (cacheIntercept(data)) {
    console.log('cache, not report ');
    return;
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
 * 缓存管理
 */
function cacheIntercept(data: ICommonMessage) {
  const cloneData = {...data};
  const cache = getGlobalCache();
  if (cache) {
    const time = cloneData.$time;
    delete cloneData.$time;
    const key = JSON.stringify(cloneData);
    if (cache.get(key)) {
      console.log('命中缓存，不上报');
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
