import { getCommonMessage } from "../plugins/message";
import { report } from "../reporter";
import { off, on } from "../utils/tool";

export default class WrapError {
  // 只初始化一次
  private static isInit: boolean = false;
  // 自动采集数据
  private static isAutoTrack: boolean = true;
  private static errorConfig: IErrorEventCapacity;
  static autoTrack(conf: IErrorEventCapacity) {
    if (!conf || !conf.enable || WrapError.isInit) return;
    WrapError.isInit = true;
    WrapError.errorConfig = conf;
    const ins = new WrapError();
    ins.init();
  }

  /**
   * 不收集收据了（重写的方法不恢复原来的，以防其他库再次重写了方法被我们覆盖了）
   */
  static stopTrack() {
    WrapError.isAutoTrack = false;
  }

  static resumeTrack() {
    WrapError.isAutoTrack = true;
  }

  /**
   * 初始化
   */
  init() {
    // js错误或静态资源加载错误
    on('error', this.handleError.bind(this));
    //promise错误
    on('unhandledrejection', this.handleError.bind(this));
  }

  handleError(event: Event) {
    if (!WrapError.isAutoTrack) return;
    let result;
    switch (event.type) {
      case 'error': {
        result = event instanceof ErrorEvent ? this.extractJSError(event)  : this.extractResourceError(event);
        break;
      }
      case 'unhandledrejection': {
        result = this.extractPromiseError(event);
        break;
      }
      default:
        break;
      }
    report(result);
  }

  // 捕获js异常
  extractJSError(e: ErrorEvent): IErrorMessage{
    const commonMsg = getCommonMessage();
    const msg = e.message || '';
    const stackStr = e.error.stack || '';
    const data: IErrorMessage = {
      ...commonMsg,
      $event_type: '$error',
      $category_id: 'jsError',
      $err_msg: msg && msg.substring(0, 1e3), // 信息
      $err_detail: stackStr && stackStr.substring(0, 1e3), // 错误栈
      $err_file: e.filename, // 出错文件
      $err_line: e.lineno, // 行
      $err_col: e.colno, // 列
    }
    return data;
  }

  // 捕获资源异常
  extractResourceError(e: Event): IErrorMessage{
    const commonMsg = getCommonMessage();
    const target = e.target as any;
    const data: IErrorMessage = {
      ...commonMsg,
      ...{
        $event_type: '$error',
        $category_id: 'resource_error',
        $err_msg: target.outerHTML,
        $err_file: target.src,
        $err_detail: target.localName.toUpperCase(),
      }
    }
    return data;
  }

  // 捕获promise异常
  extractPromiseError(e: any): IErrorMessage{
    const commonMsg = getCommonMessage()
    const data: IErrorMessage = {
      ...commonMsg,
      ...{
        $event_type: '$error',
        $category_id: 'promise_error',
        $err_msg: e.reason,
      }
    }
    return data;
  }
}
