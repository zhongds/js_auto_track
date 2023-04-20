export default class Hooker {
  hookMap = Object.create(null) as {[key: string]: Function[]};

  hook(k: string, fn: Function) {
    if (!k || typeof fn !== 'function') return;
    const items = this.hookMap[k];
    if (items) {
      items.push(fn);
    }
  }

  /**
   * 按顺序执行，前一个执行的结果作为后一个执行的参数
   * @param k 
   * @param args 
   * @returns 
   */
  triggerInOrder(k: string, ...args): any {
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
}
