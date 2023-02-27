import wkStr from '../worker';

export interface IWorkerBody {
  message: any;
  transfer?: Transferable[];
  callback?: (e: MessageEvent) => void; // worker执行完的message回调
}

export default class GlobalWorker {

  private static ins: GlobalWorker;
  static getInstance(): GlobalWorker {
    if (GlobalWorker.ins) {
      return GlobalWorker.ins;
    }
    GlobalWorker.ins = new GlobalWorker();
    GlobalWorker.ins.init();
    return GlobalWorker.ins;
  }

  private worker: Worker;
  private listeners: Function[] = [];
  // 一次性监听，监听完就删除
  private callbacks: Function[] = [];
  /**
   * 初始化
   */
  private init() {
    // 创建 Blob 对象
    const blob = new Blob([`
      ${wkStr}
    `], { type: 'text/javascript' });

    // 将 Blob 对象转换为 URL 字符串
    const workerUrl = URL.createObjectURL(blob);

    // 创建 Web Worker
    const worker = new Worker(workerUrl);

    // 监听 Web Worker 的消息 TODO 
    worker.addEventListener('message', event => {
      // 监听
      if (this.listeners && this.listeners.length > 0) {
        this.listeners.forEach((fn => fn.call(worker, event)));
      }
      // 回调完清空
      if (this.callbacks && this.callbacks.length > 0) {
        this.callbacks.forEach(fn => fn.call(worker, event));
        this.callbacks = [];
      }
    });

    // 释放 URL 对象
    URL.revokeObjectURL(workerUrl);

    this.worker = worker;
  }

  /**
   * 添加监听
   * 返回当前位置，可用于删除
   * @param fn 
   * @returns 
   */
  private addListener(fn: Function): number {
    if (GlobalWorker.ins && typeof fn === 'function') {
      this.listeners.push(fn);
      return this.listeners.length - 1;
    }
    
  }

  /**
   * 移除监听
   * @param index 
   * @returns 
   */
  private removeListener(index: number) {
    if (index < 0) {
      return;
    }
    this.listeners.splice(index, 1);
  }

  /**
   * 发送消息
   * @param message 
   * @param transfer 
   */
  postMessage(message: any, transfer?: Transferable[]): void {
    if (this.worker) {
      this.worker.postMessage(message, transfer);
    }
  }

  /**
   * 发送消息
   * @param body 
   */
  postAutoMessage(body: IWorkerBody): void {
    this.postMessage(body.message, body.transfer);
    if (body.callback) {
      this.callbacks.push(body.callback);
    }
  }
}
