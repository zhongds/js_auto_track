import { warn } from "./utils/tool";

export function report(data: ICommonMessage) {
  
}


function sendImg() {
  
}


function sendBeacon(data) {
  window && window.navigator && "function" == typeof window.navigator.sendBeacon 
    ? window.navigator.sendBeacon(Config.reportUrl, JSON.stringify(data))
    : warn("navigator.sendBeacon not surported")
}