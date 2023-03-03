/**
 * 包装日志
 */
export default class TrackLog {
  private static logLevel: boolean|number = false;

  static setLevel(level: boolean|number) {
    this.logLevel = level;
  }

  static log(...arr) {
    if (this.checkIsPrint(1)){
      console.log(...arr);
    }
  }

  static info(...arr) {
    if (this.checkIsPrint(2)) {
      console.info(...arr);
    };
  }

  static warn(...arr) {
    if (this.checkIsPrint(3)) {
      console.warn(...arr);
    };
  }

  static error(...arr) {
    if (this.checkIsPrint(4)) {
      console.error(...arr);
    };
  }

  private static checkIsPrint(level: number): boolean {
    if (!this.logLevel || (typeof this.logLevel === 'number' && this.logLevel > level)) return false;
    return true;
  }
}
