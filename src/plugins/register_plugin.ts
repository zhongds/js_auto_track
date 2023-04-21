import { CLIENT_HOOK_EVENT } from "../config/constant";
import { checkIsObject } from "../utils/tool";
import BasePlugin from "./base_plugin";

/**
 * 静态属性
 */
export interface IStaticProps {
  events: string[],
  properties: object,
}

/**
 * 注入事件属性
 */
class RegisterPlugin extends BasePlugin {
  name: string = 'register_plugin';

  setup(client: ITrackClient): boolean {
    return super.setup(client);
  }

  destroy(): void {
    
  }

  register(obj: IStaticProps) {
    if (!this.client || !this.checkStaticPropsValid(obj)) return;
    this.client.hook(CLIENT_HOOK_EVENT.BEFORE_REPORT, function(data: ICommonMessage) {
      // TODO 注入属性
      return false;
    })
  }

  hookRegister() {

  }

  private checkStaticPropsValid(obj: IStaticProps): boolean {
    if (!checkIsObject(obj)) return false;
    const {events, properties} = obj;
    if (!events || events.length === 0 || !checkIsObject(properties)) return false;
    return true;
  }
}

