import { warn } from "./utils/tool";

export function report(data: ICommonMessage) {
  
}


function sendImg() {
  
}


function sendBeacon(e: ReportData) {
  window && window.navigator && "function" == typeof window.navigator.sendBeacon 
    ? window.navigator.sendBeacon(Config.reportUrl, JSON.stringify(e))
    : warn("navigator.sendBeacon not surported")
}