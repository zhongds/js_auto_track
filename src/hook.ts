import { getCommonMessage } from "../config/message";
import { handlePV } from "./handler";

/**
 * 页面变化，上报PV
 */
export function setPage() {
  handlePV();
}

/**
 * 重写history方法
 * @param key 'pushState'|'replaceState'
 */
export function hookHistorySate(key: 'pushState'|'replaceState'): void {
  if (window[`@@track_${key}`]) return;
  window[`@@track_${key}`] = history[key];
  history[key] = function (){
    window[`@@track_${key}`].call(history, ...arguments);
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
    window['@@track_popstate'].call(window, ...arguments);
    setPage();
  }
}





