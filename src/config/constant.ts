// 上报的事件类型
export const PV_EVENT_TYPE = '$page_view';
export const API_EVENT_TYPE = '$api';
export const CLICK_EVENT_TYPE = '$element_click';
export const ERROR_EVENT_TYPE = '$error';
export const RES_EVENT_TYPE = '$resource_performance';
export const PAGE_LEAVE_EVENT_TYPE = '$page_leave';
// 用户自定义事件类型
export const USER_DEFINED_EVENT_TYPE = '$user_defined';

// 拦截器名
export const EVENT_MESSAGE_INTERCEPTOR = 'event_message_interceptor';


/**
 * url上的trace_id
 */
export const URL_TRACE_ID_KEY = '__trace_id__';

export const URL_SPAN_ID_KEY = '__span_id__';

/**
 * 元素配了这个就会上报
 */
export const AUTO_TRACK_CLICK_ATTR = 'data-track-click';

/**
 * 元素配了这个会忽略上报
 */
export const AUTO_TRACK_CLICK_IGNORE_ATTR = 'data-track-click-ignore';

/**
 * sdk的生命周期
 */
export const CLIENT_LIFECYLE_EVENT = {
  INIT: 'init', // 初始化本地配置
  REMOTE_CONFIG_CHANGED: 'remote_config_changed', // 拉取远端配置后触发
  START: 'start', // 加载各种插件
  BEFORE_BUILD: 'before_build', // 生成事件信息，触发时机：获取到commonMessage的时候
  BEFORE_REPORT: 'before_report', // 上报之前
}

export const CLIENT_HOOK_EVENT = {
  BEFORE_BUILD: 'before_build',
  BEFORE_REPORT: 'before_report',
}
