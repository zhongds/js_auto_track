/**
 * 拦截
 * 1. 多次hook同一个地方，会按顺序执行，上一个执行的结果作为下一个的入参
 */
export default class Hooker {
  hookMap = Object.create(null) as {[key: string]: Function[]};

  hook(k: string, fn: Function) {
    if (!k || typeof fn !== 'function') return;
    const items = this.hookMap[k];
    if (items) {
      items.push(fn);
    }
  }

  triggerHook(k: string, ...args): any {
    this.triggerInOrder(k, ...args);
  }

  /**
   * 按顺序执行，前一个执行的结果作为后一个执行的参数
   * @param k 
   * @param args 
   * @returns 
   */
  private triggerInOrder(k: string, ...args): any {
    const items = this.hookMap[k];
    if (!items) return null;
    let res = null;
    items.forEach((fn, i) => {
      if (i === 0) {
        res = fn(...args);
      } else {
        res = fn(res);
      }
    });
    return res;
  }

  removeHook(k: string, fn: Function) {
    const items = this.hookMap[k];
    if (!items || typeof fn !== 'function') return;
    const arr = [];
    items.filter((item, i) => {
      if (item === fn) {
        arr.push(i);
      }
    });
    for(let i=arr.length -1; i>=0; i--) {
      items.splice(i, 1);
    }
  }
}
