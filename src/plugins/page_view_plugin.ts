import { PV_EVENT_NAME } from "../config/constant";
import { setPageLoadendTime, setPageSpanId } from "../config/global";
import TrackLog from "./log";
import { report } from "../reporter";
import { checkIsReport, on } from "../utils/tool";
import { getCommonMessage } from "../models/message";

// 兼容判断
const supported = {
  performance: !!window.performance,
  getEntriesByType: !!(window.performance && performance.getEntriesByType),
  PerformanceObserver: 'PerformanceObserver' in window,
  MutationObserver: 'MutationObserver' in window,
  PerformanceNavigationTiming: 'PerformanceNavigationTiming' in window,
};

class PageViewPlugin implements IBasePlugin {
  // 只初始化一次
  private static isInit: boolean = false;
  // 自动采集数据
  private isAutoTrack: boolean = true;
  private pvConfig = {} as IPageViewEventCapacity;

  name: string = 'page_view_plugin';

  setup(client: ITrackClient, conf: IPageViewEventCapacity): void {
    if (!conf || !conf.enable || PageViewPlugin.isInit) return;
    PageViewPlugin.isInit = true;
    this.isAutoTrack = true;
    this.pvConfig = conf;
    this.init();
  }

  /**
   * 
   */
  destroy() {
    PageViewPlugin.isInit = false;
    this.isAutoTrack = false;
  }

  private init() {
    'complete' === window.document.readyState ? this.setPage() : on('load', this.setPage.bind(this));
    this.hookPopstate();
    if (this.pvConfig.spa) {
      this.hookHistorySate('pushState');
      this.hookHistorySate('replaceState');
    }
  }

  /**
   * 页面变化，上报PV
   */
  private setPage() {
    // 过滤数据
    if (!this.isAutoTrack) {
      TrackLog.log('pv不采集');
      return;
    }
    this.handlePV();
  }

  /**
   * 检查是否需要上报, true-上报
   * @param data 
   * @returns 
   */
  private checkDataReport(data: IPageViewMessage): boolean {
    if (this.pvConfig) {
      const {include_pages, exclude_pages} = this.pvConfig;
      return checkIsReport(include_pages, exclude_pages, data.$url);
    }
    return false;
  }

  /**
   * 上报pv + 性能数据
   * @returns 
   */
  private handlePV() {
    if (window.performance.timing.loadEventEnd) {
      // 设置页面加载完成的时间
      setPageLoadendTime(Date.now());

      const data = this.genReportData();
      // 过滤数据
      if (!this.checkDataReport(data)) {
        TrackLog.log('pv被过滤了, 不上报');
        return;
      }
      setPageSpanId(data.$span_id);
      report(data);
    } else {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        this.handlePV();
      }, 50)
    }
  }

  private genReportData(): IPageViewMessage {
    const comMsg = getCommonMessage();
    const data = {
      ...comMsg,
      $event_type: PV_EVENT_NAME,
    } as IPageViewMessage;
    
    if (this.pvConfig.isPerf) {
      const perf = this.genPerfMessage();
      data.$performance = perf;
      data.$duration = perf.$duration;  
    }
    return data;
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

    // 首屏时间：从开始发起这个页面的访问开始算起,减去重定向跳转的时间,在performanceV2版本下才进行计算,v1版本的fetchStart是时间戳而不是相对于访问起始点的相对时间
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

export default new PageViewPlugin();
