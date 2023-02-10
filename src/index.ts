import { Config, IConfig, setConfig } from './config/config';
import { handleClick, handleResource } from './handler';
import { hookHistorySate, hookPopstate, setPage } from './hook';
import WrapError from './plugins/error';
import { on, rewriteEventStopPropagation } from './utils/tool';

export default class AutoTrackObj {
  constructor(option: IConfig) {
    this.init(option);
  }

  init(option: IConfig) {
    setConfig(option);

    Config.enableClick && this.addListenClick(); // done
    Config.enablePV && this.addListenRouterChange(); // done
    Config.enableRes && this.sendResource();
    Config.enableError && this.addListenError(); // done
    Config.enableHttp && this.addListenHttp(); 

    console.log("配置====", Config);
    this.addListenClose();
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
    // 首次加载设置页面变化
    'complete' === window.document.readyState ? setPage() : on('load', setPage);

    hookHistorySate('pushState');
    hookHistorySate('replaceState');
    hookPopstate();
  }

  // 发送资源
  private sendResource() {
    'complete' === window.document.readyState ? handleResource() : on('load', handleResource);
  }

  private addListenError() {
    new WrapError();
  }

  private addListenHttp() {

  }

  private addListenClose() {
    on('beforeunload', function() {
      console.log('页面关闭');
    })
  }
}