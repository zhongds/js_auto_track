/**
 * 拦截，跟监听事件机制差不多
 * 唯一区别是trigger执行逻辑变化：多个监听方法，一个监听方法执行完的结果会串行给到下一个监听方法执行
 */
export default class EventEmitter {
  listeners = Object.create(null) as {[key: string]: EventItem[]};

  on(k: string, fn: Function) {
    this.listen(k, fn, false);
  }

  once(k: string, fn: Function) {
    this.listen(k, fn, true);
  }
  
  emit(k: string, ...rets) {
    const items = this.listeners[k];
    if (!items) return;
    const remains = [];
    items.map(item => {
      item.listener(...rets);
      !item.once && remains.push(item);
    });
    this.listeners[k] = remains;
  }
  
  /**
   * 移除一次性事件和正常事件
   * @param k 
   * @param fn 
   * @returns 
   */
  off(k: string, fn: Function) {
    const items = this.listeners[k];
    if (!items || typeof fn !== 'function') return;
    const arr = [];
    items.filter((item, i) => {
      if (item.listener === fn) {
        arr.push(i);
      }
    });
    for(let i=arr.length -1; i>=0; i--) {
      items.splice(i, 1);
    }
  }

  private listen(k: string, fn: Function, once?: boolean) {
    if (typeof fn !== 'function') return;
    const items = this.listeners[k];
    const item: EventItem = {
      once,
      listener: fn,
    }
    if (items) {
      items.push(item);
    } else {
      this.listeners[k] = [item];
    }
  }
}

