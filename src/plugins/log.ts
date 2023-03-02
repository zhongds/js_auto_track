import { arguments2Arr } from "../utils/tool";

/**
 * 包装日志
 */
export default class TrackLog {
  private static logLevel: boolean|number = false;

  static setLevel(level: boolean|number) {
    this.logLevel = level;
  }

  static log() {
    if (this.checkIsPrint(1)){
      const arr = arguments2Arr(arguments);
      console.log(...arr);
    }
  }

  static info() {
    if (this.checkIsPrint(2)) {
      const arr = arguments2Arr(arguments);
      console.info(...arr);
    };
  }

  static warn() {
    if (this.checkIsPrint(3)) {
      const arr = arguments2Arr(arguments);
      console.warn(...arr);
    };
  }

  static error() {
    if (this.checkIsPrint(4)) {
      const arr = arguments2Arr(arguments);
      console.error(...arr);
    };
  }

  private static checkIsPrint(level: number): boolean {
    if (!this.logLevel || (typeof this.logLevel === 'number' && this.logLevel > level)) return false;
    return true;
  }
}
