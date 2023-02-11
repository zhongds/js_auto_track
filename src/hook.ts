import { getCommonMessage } from "./config/message";
import PageViewPerf from "./plugins/page_view";

/**
 * 页面变化，上报PV
 */
export function setPage() {
  PageViewPerf.reportPV();
}

/**
 * 重写history方法
 * @param key 'pushState'|'replaceState'
 */
export function hookHistorySate(key: 'pushState'|'replaceState'): void {
  if (window[`@@track_${key}`]) return;
  window[`@@track_${key}`] = history[key];
  history[key] = function (){
    const args = 1 === arguments.length ? [arguments[0]] : Array.apply(null, arguments);
    window[`@@track_${key}`].call(history, ...args);
    setPage();
  }
}

/**
 * 重写window.onpopstate方法
 */
export function hookPopstate(): void {
  if (window['@@track_popstate']) return;
  window['@@track_popstate'] = window.onpopstate;
  window.onpopstate = function () {
    const args = 1 === arguments.length ? [arguments[0]] : Array.apply(null, arguments);
    window['@@track_popstate'].call(window, ...args);
    setPage();
  }
}





