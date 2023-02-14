/**
 * 缓存管理, 默认存60秒
 */
export interface ICacheOption {
  maxCache: number;
}

export interface ICache {
  extendOptions(option: ICacheOption): void;
  get(key: string): any;
  set(key: string, value: any);
  delete(key: string): boolean;
  clear(): void;
}

export class MemoryCache implements ICache {
  private cache: Map<string, any>;
  private timer: any;
  private maxCache: number; // 最大缓存梳理，0-表示无穷大
  constructor(option?: ICacheOption) {
    this.cache = new Map<string, any>();
    this.timer = {};
    this.extendOptions(option);
  }

  extendOptions(option?: ICacheOption): void {
    this.maxCache = (option && option.maxCache) || 0;
  }

  get(key: string) {
    return this.cache.get(key);
  }

  set(key: string, value: any, ttl = 60000): void {
    // 如果超过最大缓存数, 删除头部的第一个缓存.
    if (this.maxCache > 0 && this.cache.size >= this.maxCache) {
      const deleteKey = Object.keys(this.cache)[0];
      this.cache.delete(deleteKey);
      if (this.timer[deleteKey]) {
        clearTimeout(this.timer[deleteKey]);
      }
    }
    this.cache.set(key, value);
    if (ttl > 0) {
      this.timer[key] = setTimeout(() => {
        this.cache.delete(key);
        delete this.timer[key];
      }, ttl);
    }
  }

  delete(key: string): boolean {
    delete this.timer[key];
    return this.cache.delete(key);
  }

  clear(): void {
    this.timer = {};
    this.cache.clear();
  }
}