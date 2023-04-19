/**
 * 存储管理
 */
class SimpleStorage implements IStorage{
  keys = {};

  getItem(key: string): string {
    return localStorage.getItem(key);
  }
  setItem(key: string, value: string): void {
    this.keys[key] = 1;
    return localStorage.setItem(key, value);
  }
  removeItem(key: string) {
    if (key) {
      delete this.keys[key];
      return localStorage.removeItem(key);
    }
  }
  clear() {
    Object.keys(this.keys).forEach(k => {
      localStorage.removeItem(k);
    });
    this.keys = {};
  }
  
}

export default new SimpleStorage();
