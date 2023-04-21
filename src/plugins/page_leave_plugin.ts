/**
 * 页面离开事件
 * （要跟pv一起开启，单独开启不生效）
 */

import { PAGE_LEAVE_EVENT_TYPE } from "../config/constant";
import { getPageLoadendTime } from "../config/global";
import TrackLog from "../models/log";
import { checkIsReport, on } from "../utils/tool";
import BasePlugin from "./base_plugin";

class PageLeavePlugin extends BasePlugin {
  // 自动采集数据
  private isAutoTrack: boolean = true;
  private conf: IPageLeaveEventCapacity;
  setup(client: ITrackClient, value: IPageLeaveEventCapacity) {
    if (super.setup(client, value)) {
      if (!value || !value.enable) return;
      this.conf = value;
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
    on('unload', this.handlePageLeave.bind(this));
  }

  /**
   * 检查是否需要上报, true-上报
   * @param data 
   * @returns 
   */
  private checkDataReport(data: IPageLeaveMessage): boolean {
    if (data && this.conf) {
      const { include_pages, exclude_pages } = this.conf;
      return checkIsReport(include_pages, exclude_pages, data.$url);
    }
    return false;
  }

  /**
   * 上报页面离开事件
   * @returns 
   */
  private handlePageLeave() {
    // 过滤数据
    if (!this.isAutoTrack || !this.client) {
      TrackLog.log('page_leave事件被过滤了');
      return;
    }
    const startTime = getPageLoadendTime();
    if (!startTime || typeof startTime !== 'number') {
      TrackLog.warn('获取不到页面加载完成时间: ', startTime);
      return;
    }
    const data = this.genReportData(startTime);
    // 过滤数据
    if (!data || !this.checkDataReport(data)) {
      TrackLog.log('page_leave事件被过滤了, 不上报');
      return;
    }
    this.client.toReport(data);
  }

  private genReportData(startTime: number): IPageLeaveMessage {
    const comMsg = this.client.getCommonMessage(PAGE_LEAVE_EVENT_TYPE);
    if (!comMsg) return null;
    const data = {
      ...comMsg,
      $duration: (Date.now() - startTime) / 1000,
    } as IPageLeaveMessage;
    return data;
  }
}

export default new PageLeavePlugin();
