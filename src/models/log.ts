import { noop } from "../utils/tool";

let WrapConsole = window.console as any;
if ('object' !== typeof window.console) {
  WrapConsole = {
    log: noop,
    info: noop,
    warn: noop,
    error: noop,
  };
}

export default class TrackLog {
  private static logLevel: boolean|number = false;

  static setLevel(level: boolean|number) {
    this.logLevel = level;
  }

  static log(...args) {
    this.print('log', 1, args);
  }

  static info(...args) {
    this.print('info', 2, args);
  }

  static warn(...args) {
    this.print('warn', 3, args);
  }

  static error(...args) {
    this.print('error', 4, args);
  }

  private static print(key: string, level: number, args: any) {
    if (!this.logLevel || (typeof this.logLevel === 'number' && this.logLevel < level)) return;
    const arr = args.length === 1 ? [args[0]] : Array.from(null, args);
    WrapConsole[key].apply(WrapConsole, arr);
  }
}
