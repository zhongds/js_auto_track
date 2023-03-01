import { noop } from "../utils/tool";

if ('object' !== typeof window.console) {
  window.console = {
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

  static log() {
    this.print('log', 1, arguments);
  }

  static info() {
    this.print('info', 2, arguments);
  }

  static warn() {
    this.print('warn', 3, arguments);
  }

  static error() {
    this.print('error', 4, arguments);
  }

  private static print(key: string, level: number, args: any) {
    if (!this.logLevel || (typeof this.logLevel === 'number' && this.logLevel < level)) return;
    const arr = args.length === 1 ? [args[0]] : Array.from(null, args);
    console[key].apply(console, arr);
  }
}