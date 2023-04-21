import { Config } from "../../config/config";
import md5 from 'md5';
import { getGlobalCache } from "../../config/global";
import TrackLog from "../../models/log";
import { CLIENT_HOOK_EVENT, CLIENT_LIFECYLE_EVENT } from "../../config/constant";
import {gzip} from 'pako';

const ReportDataRetryKey = '$track_sdk_report_data_retry'; // 重试

export default class Reporter {

  client: ITrackClient;

  constructor(client: ITrackClient) {
    this.client = client;
  }

  report(data: ICommonMessage) {
    TrackLog.log('上报数据: ', data);
    if (!data) {
      return;
    }
    // 避免错误重复上报
    if (this.cacheIntercept(data)) {
      TrackLog.log('cache, not report ');
      return;
    }

    const newData = this.client.triggerHook(CLIENT_HOOK_EVENT.BEFORE_REPORT, data);
    if (!newData) return;

    this.client.emit(CLIENT_LIFECYLE_EVENT.BEFORE_REPORT, newData);
  
    // TODO 插件里单独执行
    // if (data.$event_type === PV_EVENT_NAME || data.$event_type === CLICK_EVENT_NAME) {
    //   genScreenshot(data.$span_id, document.body);
    // }
    
    if (window.navigator && "function" == typeof window.navigator.sendBeacon) {
      window.navigator.sendBeacon(Config.reportUrl, JSON.stringify(newData))
    } else {
      const url = this.createUrl(newData);
      this.sendImg(url)
    }
  }
  
  private acheUrl2Local(url: string) {
    try {
      const arrStr = localStorage.getItem(ReportDataRetryKey);
      const arr = arrStr ? JSON.parse(arrStr) : [];
      arr.push(url);
      localStorage.setItem(ReportDataRetryKey, JSON.stringify(arr));
    } catch(err) {
      TrackLog.error('report url cache to localStorage error:', err);
    }
  }
  
  private reportLocalData() {
    try {
      const arrStr = localStorage.getItem(ReportDataRetryKey);
      const arr = JSON.parse(arrStr);
      // TODO
      arr.forEach(v => this.sendImg(v));
    } catch(err) {
      TrackLog.error('get report url from localStorage error:', err);
    }
  }
  
  /**
   * 缓存管理，降低重复数据上报的频率
   */
  impactKeys = ['$time']; //影响因子
  private cacheIntercept(data: ICommonMessage) {
    const cloneData = {...data};
    const cache = getGlobalCache();
    if (cache) {
      this.impactKeys.forEach((k => delete cloneData[k]));
      const key = JSON.stringify(cloneData);
      if (cache.get(key)) {
        TrackLog.log('命中缓存，不上报');
        return true;
      }
      cache.set(key, 1);
    }
    return false;
  }
  
  private sendImg(src, successCallback?, errorCallback?) {
    const img = new Image();
    img.src = src;
  }
  
  private createUrl(queue) {
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
      param = this.genCompressData(param);
      addGzip = '&gzip=1';
    }
    
    const {appId, secret, reportUrl} = Config;
    value = 'appId=' + appId + 'log=' + param + 'v=' + this.client.version;
  
    sig = md5(value + secret);
  
    query = 'appId=' + appId + '&log=' + encodeURIComponent(param) + '&v=' + this.client.version + '&sig=' + sig + addGzip;
  
    return reportUrl + '?' + query; 
  }
  
  private genCompressData(msg: string) {
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
}



