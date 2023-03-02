import TrackLog from "../plugins/log";
import { checkIsObject } from "../utils/tool";


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
 export function setUserProperty(key: string, fn: UserPropertyType) {
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
  return transUserProperties(Runnable);
}

/**
 * 转换用户数据：主要是检查到function就执行，处理动态获取的值
 * @param obj 对象
 * @returns 
 */
export function transUserProperties(obj: any) {
  if (!checkIsObject(obj)) return {};
  return Object.keys(obj).reduce((res, k) => {res[k] = run(obj[k]); return res;}, {});
}

/**
 * 获取用户通用属性
 * @returns 
 */
export function getUserProperty(key: string) {
  return key && Runnable[key] ? run(Runnable[key]) : '';
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