// 上报的事件名
export const PV_EVENT_NAME = '$page_view';
export const API_EVENT_NAME = '$api';
export const CLICK_EVENT_NAME = '$element_click';
export const ERROR_EVENT_NAME = '$error';
export const RES_EVENT_NAME = '$resource_performance';
export const PAGE_LEAVE_EVENT_NAME = '$page_leave';


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
