import { ERROR_EVENT_TYPE } from "../config/constant";
import { off, on } from "../utils/tool";
import BasePlugin from "./base_plugin";

class WrapErrorPlugin extends BasePlugin {

  name: string = 'wrap_error_plugin';
  // 自动采集数据
  private isAutoTrack: boolean = true;
  private errorConfig: IErrorEventCapacity;
  setup(client: ITrackClient, conf: IErrorEventCapacity) {
    if (super.setup(client, conf)) {
      if (!conf || !conf.enable) return;
      this.errorConfig = conf;
      this.init();
    }
    return true;
  }

  /**
   * 
   */
  destroy() {
    super.destroy();
    this.isAutoTrack = false;
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
    if (!this.isAutoTrack || !this.client) return;
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
    if (result) {
      this.client.toReport(result);
    }
  }

  // 捕获js异常
  extractJSError(e: ErrorEvent): IErrorMessage|Falsy{
    const commonMsg = this.client.getCommonMessage(ERROR_EVENT_TYPE);
    if (!commonMsg) return null;
    const msg = e.message || '';
    const stackStr = e.error.stack || '';
    const data: IErrorMessage = {
      ...commonMsg,
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
  extractResourceError(e: Event): IErrorMessage | Falsy{
    const commonMsg = this.client.getCommonMessage(ERROR_EVENT_TYPE);
    if (!commonMsg) return null;
    const target = e.target as any;
    const data: IErrorMessage = {
      ...commonMsg,
      ...{
        $category_id: 'resource_error',
        $err_msg: target.outerHTML,
        $err_file: target.src,
        $err_detail: target.localName.toUpperCase(),
      }
    }
    return data;
  }

  // 捕获promise异常
  extractPromiseError(e: any): IErrorMessage|Falsy{
    const commonMsg = this.client.getCommonMessage(ERROR_EVENT_TYPE);
    if (!commonMsg) return null;
    const data: IErrorMessage = {
      ...commonMsg,
      ...{
        $event_type: ERROR_EVENT_TYPE,
        $category_id: 'promise_error',
        $err_msg: e.reason,
      }
    }
    return data;
  }
}

export default new WrapErrorPlugin();
