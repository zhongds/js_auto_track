import { getCommonMessage } from "../models/message";
import { report } from "../reporter";
import { checkIsObject } from "../utils/tool";


export default class UserDefined {
  static track(eventName: string, userProps: UserMessage) {
    if (!eventName || checkIsObject(userProps)) return;
    const msg = getCommonMessage();
    const data: IUserDefinedEventMessage = {
      ...msg,
      $event_name: eventName,
      $event_type: '$user_defined',
      ...userProps,
    };
    report(data);
  }
}
