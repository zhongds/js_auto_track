import TrackLog from "../plugins/log";


/**
 * 保存设置的通用属性
 */
 const Runnable = {} as any;

/**
 * 设置全局属性
 * @param key 通用属性的key
 * @param fn value值，支持动态和静态
 * @returns 
 */
 export function setCommonProperty(key: string, fn: UserPropertyType) {
  if (!key || typeof key !== 'string') {
    return;
  }
  Runnable[key] = fn;
}

/**
 * 获取用户通用属性
 * @returns 
 */
export function getUserProperties() {
  return Object.keys(Runnable).reduce((res, k) => {res[k] = run(Runnable[k]); return res;}, {});
}

export function run(fn: UserPropertyType): any {
  try {
    if (fn && typeof fn === 'function') {
      const result = fn.call(null);
      return typeof result === 'function' ? '[function]' : result;
    }
    return fn;
  } catch (error) {
    TrackLog.error('error:::', error);
  }
  return '';
}