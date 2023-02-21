import { genSpanId, getClickSpanId, getPageSpanId, getParentPageSpanId, getTraceId, setPageSpanId } from "../config/global";
import { getCommonMessage } from "../models/message";
import { genScreenshot } from "../models/screenshot";
import { report } from "../reporter";
import { on } from "../utils/tool";

// 兼容判断
const supported = {
  performance: !!window.performance,
  getEntriesByType: !!(window.performance && performance.getEntriesByType),
  PerformanceObserver: 'PerformanceObserver' in window,
  MutationObserver: 'MutationObserver' in window,
  PerformanceNavigationTiming: 'PerformanceNavigationTiming' in window,
};
export default class PageViewPerf {
  // 只初始化一次
  private static isInit: boolean = false;
  // 自动采集数据
  private static isAutoTrack: boolean = true;
  private static enableSPA: boolean = false;
  static autoTrack(enableSPA?: boolean) {
    if (PageViewPerf.isInit) return;
    PageViewPerf.isInit = true;
    PageViewPerf.enableSPA = enableSPA || false;
    const ins = new PageViewPerf();
    ins.init();
  }

  /**
   * 不收集收据了（重写的方法不恢复原来的，以防其他库再次重写了方法被我们覆盖了）
   */
  static stopTrack() {
    PageViewPerf.isAutoTrack = false;
  }

  static resumeTrack() {
    PageViewPerf.isAutoTrack = true;
  }

  private init() {
    'complete' === window.document.readyState ? this.setPage() : on('load', this.setPage.bind(this));
    this.hookPopstate();
    if (PageViewPerf.enableSPA) {
      this.hookHistorySate('pushState');
      this.hookHistorySate('replaceState');
    }
  }

  /**
   * 页面变化，上报PV
   */
  private setPage() {
    PageViewPerf.isAutoTrack && this.handlePV();
  }

  /**
   * 上报pv + 性能数据
   * @returns 
   */
  private handlePV() {
    const comMsg = getCommonMessage();
    const data = {
      ...comMsg,
      $event_type: '$page_view',
    } as IPageViewMessage;
    setPageSpanId(comMsg.$span_id);

    let timer = setInterval(() => {
      if (window.performance.timing.loadEventEnd) {
        clearInterval(timer);
        const perf = this.genPerfMessage();
        data.$performance = perf;
        data.$duration = perf.$duration;
        // 生成图片
        genScreenshot(document.body);
        report(data);
      }
    }, 50)
  }

  /**
   * 重写history方法
   * hash变化，路径变化, 不会触发popstate事件 => 重写这两个方法
   * @param key 'pushState'|'replaceState'
   */
  private hookHistorySate(key: 'pushState'|'replaceState'): void {
    if (window[`@@track_${key}`]) return;
    window[`@@track_${key}`] = history[key];
    const _this = this;
    history[key] = function (){
      const args = 1 === arguments.length ? [arguments[0]] : Array.apply(null, arguments);
      window[`@@track_${key}`].apply(history, args);
      _this.setPage();
    }
  }

  /**
   * 监听路由变化
   * 1. hash变化: 监听popstate
   * 2. 浏览器前进后退：监听popstate
   */
  private hookPopstate(): void {
    if (window['@@track_popstate']) return;
    window['@@track_popstate'] = window.onpopstate;
    const _this = this;
    window.onpopstate = function () {
      const args = 1 === arguments.length ? [arguments[0]] : Array.apply(null, arguments);
      window['@@track_popstate'].apply(window, args);
      _this.setPage();
    }
  }

  private genPerfMessage(): IPagePerformance {
    let t = window.performance.timing as any;

    const times = {} as IPagePerformance;

    times.$fmp = 0; // 首屏时间 (渲染节点增量最大的时间点)
    if (supported.getEntriesByType) {
      const paintEntries = performance.getEntriesByType('paint');
      if (paintEntries.length) times.$fmp = Math.round(paintEntries[paintEntries.length - 1].startTime);

      // 优先使用 navigation v2  https://www.w3.org/TR/navigation-timing-2/
      if (supported.PerformanceNavigationTiming) {
        const nt2Timing = performance.getEntriesByType('navigation')[0];
        if (nt2Timing) t = nt2Timing;
      }
    }

    // 从开始发起这个页面的访问开始算起,减去重定向跳转的时间,在performanceV2版本下才进行计算,v1版本的fetchStart是时间戳而不是相对于访问起始点的相对时间
    if (times.$fmp && supported.PerformanceNavigationTiming) times.$fmp = Math.round(times.$fmp - t.fetchStart);

    // 白屏时间 (从请求开始到浏览器开始解析第一批HTML文档字节的时间差)
    times.$fpt = Math.round(t.responseEnd - t.fetchStart);

    times.$tti = Math.round(t.domInteractive - t.fetchStart); // 首次可交互时间

    times.$ready = Math.round(t.domContentLoadedEventEnd - t.fetchStart); // HTML加载完成时间

    times.$load_on = Math.round(t.loadEventStart - t.fetchStart); // 页面完全加载时间

    times.$first_byte = Math.round(t.responseStart - t.domainLookupStart); // 首包时间

    times.$dns = Math.round(t.domainLookupEnd - t.domainLookupStart); // dns查询耗时

    times.$tcp = Math.round(t.connectEnd - t.connectStart); // tcp连接耗时

    times.$ttfb = Math.round(t.responseStart - t.requestStart); // 请求响应耗时

    times.$trans = Math.round(t.responseEnd - t.responseStart); // 内容传输耗时

    times.$dom = Math.round(t.domInteractive - t.responseEnd); // dom解析耗时

    times.$res = Math.round(t.loadEventStart - t.domContentLoadedEventEnd); // 同步资源加载耗时

    times.$ssl_link = Math.round(t.connectEnd - t.secureConnectionStart); // SSL安全连接耗时

    times.$redirect = Math.round(t.redirectEnd - t.redirectStart); // 重定向时间

    times.$unloadTime = Math.round(t.unloadEventEnd - t.unloadEventStart); // 上一个页面的卸载耗时

    times.$duration = Math.round(t.loadEventEnd - (t.navigationStart || 0)); // 总耗时

    return times;
  }
}
