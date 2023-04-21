/**
 * 包装日志
 */

const TAG = 'TRACK_LOG';

export default class TrackLog {
  private static logLevel: boolean|number = false;

  static setLevel(level: boolean|number) {
    this.logLevel = level;
  }

  static log(...arr) {
    if (this.checkIsPrint(1)){
      try {
        console.log(`[${TAG} ${new Error().stack.split('\n')[2].trim()}]`, ...arr);
      } catch (error) {
        console.log(...arr);
      }
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
      try {
        console.error(`[${TAG} ${new Error().stack.split('\n')[2].trim()}]`, ...arr);
      } catch (error) {
        console.error(...arr);
      }
    };
  }

  private static checkIsPrint(level: number): boolean {
    if (!this.logLevel || (typeof this.logLevel === 'number' && this.logLevel > level)) return false;
    return true;
  }
}
