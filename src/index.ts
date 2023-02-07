import { Config, IConfig, setConfig } from './config/config';
import { handleClick } from './handler';
import { on, rewriteEventStopPropagation } from './utils/tool';

export default class AutoTrackObj {
  constructor(option: IConfig) {
    this.init(option);
  }

  init(option: IConfig) {
    setConfig(option);

    Config.clickElType && this.addListenClick();
    Config.enablePV && this.addListenPV();
  }

  private addListenClick() {
    on('click', handleClick);
    rewriteEventStopPropagation(handleClick);
  }

  private addListenPV() {
    
  }
}