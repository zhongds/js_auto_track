import { API_EVENT_TYPE } from "../config/constant";
import BasePlugin from "./base_plugin";

const RESPONSE_MAX_LENGTH = 1000;

/**
 * http拦截
 */
class ApiPerf extends BasePlugin {
  // 自动采集数据
  private isAutoTrack: boolean = true;
  private apiConfig: IApiEventCapacity;

  name: string = 'api_perf_plugin';

  setup(client: ITrackClient, conf: IApiEventCapacity): boolean {
    if (super.setup(client, conf)) {
      if (!conf || !conf.enable) return false;
      this.isAutoTrack = true;
      this.apiConfig = conf;
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

  private init() {
    this.hookFetch();
    this.hookAjax();
  }

  handleApiPerf(apiData: IApiPerfData) {
    if (!this.isAutoTrack || !this.client) return;
    const comMsg = this.client.getCommonMessage(API_EVENT_TYPE);
    if (!comMsg) return;
    const data: IApiPerfMessage = {
      ...comMsg,
      ...apiData,
    }
    this.client.toReport(data);
  }

  hookFetch() {
    const __fetch = window.fetch;
    if (__fetch) {
      const _this = this;
      window.fetch = function (target, options = {}) {
        const startTime = Date.now();
        const { method = 'GET' } = options;
        const result = __fetch(target, options);
        result.then((res: Response) => {
          const _res = res.clone();
          const { url, status, ok } = _res;
          const cost = Date.now() - startTime;
          const data = {
            $api_url: url,
            $api_begin: startTime,
            $api_duration: cost,
            $api_status: status,
          } as IApiPerfData;
          if (ok) {
            data.$api_success = true;
            _this.handleApiPerf(data);
          } else {
            _res.text().then(resStr => {
              data.$api_success = false;
              data.$api_msg = resStr && resStr.substring(0, RESPONSE_MAX_LENGTH);
              _this.handleApiPerf(data);
            })
          }
        }, (e) => {
          // 无法发起请求,连接失败
          const cost = Date.now() - startTime;
          const data: IApiPerfData = {
            $api_url: typeof target === 'string' ? target : target + '',
            $api_begin: startTime,
            $api_duration: cost,
            $api_status: 500,
            $api_success: false,
            $api_msg: '无法发起请求,连接失败',
          }
          _this.handleApiPerf(data);
        });
        return result;
      };
    }
  }

  hookAjax() {
    const _apiData = {} as IApiPerfData;
    const _this = this;
    const _XMLHttpRequest = window.XMLHttpRequest;
    window.XMLHttpRequest = function () {
      const xhr = new _XMLHttpRequest();
      const _open = xhr.open;
      const _send = xhr.send;
      xhr.open = function (method, url) {
        _apiData.$api_url = typeof url === 'string' ? url : (url as URL).href;
        const args = 1 === arguments.length ? [arguments[0]] : Array.apply(null, arguments);
        return _open.apply(xhr, args);
      }
      xhr.send = function (body) {
        _apiData.$api_begin = Date.now();
        _send.call(xhr, body);
      }
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          const cost = Date.now() - _apiData.$api_begin;
          _apiData.$api_duration = cost;
          _apiData.$api_status = xhr.status;
          _apiData.$api_success = xhr.status >= 200 && xhr.status < 300;
          if (!_apiData.$api_success) {
            _apiData.$api_msg = xhr.responseText.substring(0, RESPONSE_MAX_LENGTH);
          }
          _this.handleApiPerf(_apiData);
        }
      }
      return xhr;
    }
  }
}

export default new ApiPerf();
