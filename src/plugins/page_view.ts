import { genSpanId, getClickSpanId, getPageSpanId, getParentPageSpanId, getTraceId, setPageSpanId } from "../config/global";
import { getCommonMessage } from "../config/message";
import { report } from "../reporter";

// 兼容判断
const supported = {
  performance: !!window.performance,
  getEntriesByType: !!(window.performance && performance.getEntriesByType),
  PerformanceObserver: 'PerformanceObserver' in window,
  MutationObserver: 'MutationObserver' in window,
  PerformanceNavigationTiming: 'PerformanceNavigationTiming' in window,
};
export default class PageViewPerf {
  static reportPV() {
    const ins = new PageViewPerf();
    ins.init();
  }

  private init() {
    this.handlePV();
  }

  /**
   * 性能数据
   * @returns 
   */
  private handlePV() {
    const comMsg = getCommonMessage();
    const spanId = genSpanId();
    const data = {
      ...comMsg,
      $event_id: '$page_view',
      $trace_id: getTraceId(),
      $span_id: spanId,
      $parent_span_id: getParentPageSpanId(),
    } as IPageViewMessage;
    setPageSpanId(spanId);

    let timer = setInterval(() => {
      if (window.performance.timing.loadEventEnd) {
        clearInterval(timer);
        const perf = this.genPerfMessage();
        data.$performance = perf;
        report(data);
      }
    }, 50)
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
