import { Config, IConfig, setConfig } from './config/config';
import { handleClick } from './handler';
import { hookHistorySate, hookHttp, hookPopstate } from './hook';
import WrapError from './plugins/error';
import { on, rewriteEventStopPropagation } from './utils/tool';

export default class AutoTrackObj {
  constructor(option: IConfig) {
    this.init(option);
  }

  init(option: IConfig) {
    setConfig(option);

    Config.enableClick && this.addListenClick();
    Config.enablePV && this.addListenRouterChange();
    Config.enableRes && this.sendResource();
    Config.enableError && this.addListenError(); // done
    Config.enableHttp && this.addListenHttp(); // done
  }

  private addListenClick() {
    on('click', handleClick);
    // TODO 专门管理，重写Event事件
    rewriteEventStopPropagation(handleClick);
  }

  /**
   * 监听路由变化
   * 1. hash变化: 监听popstate
   * 2. 浏览器前进后退：监听popstate
   * 3. pustState/replaceState => hash变化，路径变化, 不会触发popstate事件 => 重写这两个方法
   */
  private addListenRouterChange() {
    hookHistorySate('pushState');
    hookHistorySate('replaceState');
    hookPopstate();
  }

  private sendPerf() {
    handlePerf()
  }

  // 发送资源
  private sendResource() {
    'complete' === window.document.readyState ? handleResource() : on('load', handleResource);
  }

  private addListenError() {
    new WrapError();
  }

  private addListenHttp() {
    hookHttp();
  }
}