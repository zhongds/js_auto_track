interface IStorage {
  getItem(key: string): string;
  setItem(key: string, value: string): void;
  removeItem(key: string);
  /**
   * 清空通过setItem设置的内容
   **/ 
  clear();
}
