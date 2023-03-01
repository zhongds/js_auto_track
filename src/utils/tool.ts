export const noop = function () {}

/**
 * 监听事件
 * @param eventName 事件名，如click
 * @param fn 监听事件
 */
export function on(eventName: string, fn: EventListener): void {
  window.addEventListener ? window.addEventListener(eventName, fn): window.attachEvent && window.attachEvent('on' + eventName, fn);
}

/**
 * 移除事件
 * @param eventName 事件名
 * @param fn 监听事件
 */
export function off(eventName: string, fn: EventListener): void {
  window.removeEventListener ? window.removeEventListener(eventName, fn): window.detachEvent && window.detachEvent('on' + eventName, fn);
}

/**
 * 获取当前元素的selector
 * @param target event.target | Element
 * @param lastPath 上一个元素的selector路径
 * @returns selector
 */
export function getElmSelector(target: EventTarget|Element, lastPath?: string): string {
  if (!(target instanceof Element)) {
    return lastPath ? lastPath : '';
  }
  const nodeName = target.nodeName.toLowerCase();
  if (target.id) {
    return mergeElmPath(`${nodeName}#${target.id}`, lastPath);
  }
  if (nodeName === 'body') {
    return mergeElmPath('body', lastPath);
  }
  if (!target.parentElement) {
    let cls = '';
    target.classList.forEach(v => cls += `.${v}`);
    return mergeElmPath(nodeName + cls, lastPath);
  }
  let path = nodeName;
  let tempPath = nodeName;
  let isAddPosition = false;
  const children = target.parentElement.children;
  if (children.length > 1) {
    for(let i=0; i < children.length; i++) {
      const item = children[i];
      if (children[i] === target) {
        tempPath = `${path}:nth-child(${i+1})`;
      } else if (nodeName === item.nodeName.toLowerCase()) {
        isAddPosition = true;
      }
    }
  }
  path = isAddPosition ? tempPath : path;
  const newPath = lastPath ? `${path} > ${lastPath}` : path;
  return getElmSelector(target.parentElement, newPath);
}

function mergeElmPath(path: string, lastpath?: string): string {
  return lastpath ? `${path} > ${lastpath}` : path;
}

export function randomString() {
  for (var e, t, n = 20, r = new Array(n), a = Date.now().toString(36).split(""); n--> 0;) 
    t = (e = 36 * Math.random() | 0).toString(36), r[n] = e % 3 ? t : t.toUpperCase();
  for (var i = 0; i < 8; i++) r.splice(3 * i + 2, 0, a[i]);
  return r.join("")
}

/**
 * 给url加上search参数
 * @param url 
 * @param k search的字段
 * @param v search字段的值 
 * @returns 
 */
export function addSearch2Url(url: string, k: string, v: string): string {
  if (url.indexOf('?') > -1) {
    const arr = url.split('#');
    arr[0] = arr[0].slice(-1) === '&' ? `${arr[0]}${k}=${v}` : `${arr[0]}&${k}=${v}`;
    url = arr.join('#');
  } else {
    url += `?${k}=${v}`;
  }
  return url;
}


/**
 * 从url中获取search值
 * @param url 
 * @param k search的字段
 * @returns 
 */
 export function getSearchKV(url: string, k: string): string {
  let result = '';
  if (url.indexOf('?') > -1) {
    const arr = url.split('#');
    const [, search] = arr[0].split('?');
    const data = search.split('&');
    for(var i in data) {
      const value = data[i];
      if (value.indexOf(`${k}=`) !== -1) {
          result=value.replace(`${k}=`, '');
          break;
      }
    }
  }
  return result;
}

/**
 * 检查url是否是当前域
 * 1. 空值就是同域
 * 2. 相对路径也是同域
 * @param u1 
 * @returns 
 */
export function checkIsSameDomain(u1: string): boolean {
  if (!u1 || !/https?:\/\//.test(u1)) {
    return true;
  }
  const reg = /^(https?:\/\/[\w\.-]+)\/?/g;
  const d1 = u1.replace(reg, '$1');
  return d1 === location.origin;
}

/**
 * 页面的命中规则 TODO * 模糊匹配
 * @param arr 配置的页面地址
 * @param value 当前地址url
 * @returns 
 */
export function checkIsHit(arr: string[], value: string): boolean {
  if (!arr || arr.length === 0 || !value) {
    return false;
  }
  const isHit = arr.some(v => value.indexOf(v) !== -1);
  return isHit;
}

/**
 * 检查是否上报
 * @param includes 包含的url
 * @param excludes 去除的url
 * @param value 当前url
 * @returns 
 */
export function checkIsReport(includes: string[], excludes: string[], value: string): boolean {
  // includes不存在就是所有
  const isIncluded = includes && includes.length !== 0 ? checkIsHit(includes, value) : true;
  // excludes不存在就是所有，不踢出
  const isExcluded = excludes && excludes.length !== 0 ? checkIsHit(excludes, value) : false;
  return isIncluded && !isExcluded;
}
