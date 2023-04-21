import { CLIENT_HOOK_EVENT } from "../config/constant";
import TrackLog from "../models/log";
import BasePlugin from "./base_plugin";

export default class EventBlackListPlugin extends BasePlugin {

  name = 'event_blacklist_plugin';

  setup(client: ITrackClient, option?: object): boolean {
    if (super.setup(client)) {
      this.init();
    }
    return true;
  }

  init() {
    this.client.hook(CLIENT_HOOK_EVENT.BEFORE_BUILD, this.hookBeforeEventBuild);
  }

  hookBeforeEventBuild(evt: ICommonMessage|Falsy): ICommonMessage|Falsy {
    if (!evt || !evt.$event_type) return evt;
    const {config: {event_blacklist}} = this.client;
    if (!event_blacklist || event_blacklist.length === 0) return evt;
    if (event_blacklist.indexOf(evt.$event_type) > -1) {
      TrackLog.log('黑名单事件过滤: ' + evt.$event_type);
      return false;
    }
    return evt;
  }
}

