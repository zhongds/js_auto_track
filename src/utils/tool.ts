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
 * 重写event.stopPropagation，触发全局的埋点事件
 * @param fn 拦截方法
 */
export function rewriteEventStopPropagation(fn: EventListener): void {
  const originFn = Event.prototype.stopPropagation;
  Event.prototype.stopPropagation = function() {
    fn(this);
    originFn.call(this);
  }
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
    return `${nodeName}#${target.id} > ${lastPath}`;
  }
  if (nodeName === 'body') {
    return `body > ${lastPath}`;
  }
  if (!target.parentElement) {
    let cls = '';
    target.classList.forEach(v => cls += `.${v}`);
    return `${nodeName}${cls} > ${lastPath}`;
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

export const warn: any = function () {
  const e = "object" == typeof console ? console.warn : noop;
  try {
      const t = {
          warn: e
      };
      t.warn.call(t)
  } catch (n) {
      return noop
  }
  return e
}()

export function randomString() {
  for (var e, t, n = 20, r = new Array(n), a = Date.now().toString(36).split(""); n--> 0;) 
    t = (e = 36 * Math.random() | 0).toString(36), r[n] = e % 3 ? t : t.toUpperCase();
  for (var i = 0; i < 8; i++) r.splice(3 * i + 2, 0, a[i]);
  return r.join("")
}


