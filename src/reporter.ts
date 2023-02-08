import { Config } from "./config/config";
import { warn } from "./utils/tool";

export function report(data: ICommonMessage) {
  console.log('上报数据', data);
}


function sendImg() {
  
}


function sendBeacon(data) {
  window && window.navigator && "function" == typeof window.navigator.sendBeacon 
    ? window.navigator.sendBeacon(Config.reportUrl, JSON.stringify(data))
    : warn("navigator.sendBeacon not surported")
}