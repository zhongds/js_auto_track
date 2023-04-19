/**
 * 页面离开事件
 * （要跟pv一起开启，单独开启不生效）
 */

 import { PAGE_LEAVE_EVENT_NAME } from "../config/constant";
 import { getPageLoadendTime } from "../config/global";
 import TrackLog from "../plugins/log";
 import { getCommonMessage } from "../models/message";
 import { report } from "../reporter";
 import { checkIsReport, on } from "../utils/tool";
 
 export default class PageLeave {
   // 只初始化一次
   private static isInit: boolean = false;
   // 自动采集数据
   private static isAutoTrack: boolean = true;
   private static conf: IPageLeaveEventCapacity;
   static autoTrack(value: IPageLeaveEventCapacity) {
     if (!value || !value.enable || PageLeave.isInit) return;
     PageLeave.isInit = true;
     PageLeave.conf = value;
     const ins = new PageLeave();
     ins.init();
   }
 
   /**
    * 不收集收据了（重写的方法不恢复原来的，以防其他库再次重写了方法被我们覆盖了）
    */
   static stopTrack() {
     PageLeave.isAutoTrack = false;
   }
 
   static resumeTrack() {
     PageLeave.isAutoTrack = true;
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
     if (PageLeave.conf) {
       const {include_pages, exclude_pages} = PageLeave.conf;
       return checkIsReport(include_pages, exclude_pages, data.$url);
     }
     return false;
   }
 
   /**
    * 上报页面离开事件
    * @returns 
    */
   private handlePageLeave() {
      const startTime = getPageLoadendTime();
      if (!startTime || typeof startTime !== 'number') {
        TrackLog.warn('获取不到页面加载完成时间: ', startTime);
        return;
      }
      const data = this.genReportData(startTime);
      // 过滤数据
      if (!PageLeave.isAutoTrack || !this.checkDataReport(data)) {
        TrackLog.log('page_leave事件被过滤了, 不上报');
        return;
      }
      report(data);
   }
 
   private genReportData(startTime: number): IPageLeaveMessage {
     const comMsg = getCommonMessage();
     const data = {
       ...comMsg,
       $event_type: PAGE_LEAVE_EVENT_NAME,
       $duration: (Date.now() - startTime)/1000,
     } as IPageLeaveMessage;
     return data;
   }
 }
 
