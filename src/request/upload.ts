import { Config } from "../config/config";
import { getUserCommonProperty } from "../models/user_property";
import TrackLog from "../plugins/log";
import { IPostOption, post } from "./request";

let uploadUrl = {
  callback: null as any, // fn
};
export function getUploadUrl(): Promise<string> {
  if (uploadUrl.callback) return uploadUrl.callback() as Promise<string>;
  if (Config.capture) {
    const url = Config.env === 'release' ? 'https://xldc.xunlei.com/config/v1/info' : 'https://xldc-test.xunlei.com/config/v1/info';
    const userId = getUserCommonProperty('$user_id');
    const deviceId = getUserCommonProperty('$device_id');
    if (!userId && !deviceId) {
      TrackLog.warn('user_id和device_id都不存在, 无法获取图片上传地址');
      return Promise.reject('lack user_id or device_id');
    }
    let params = userId ? {user_id: userId} : {device_id: deviceId};
    const option: IPostOption = {
      body: JSON.stringify(params),
    }
    return post(url, option).then(v => {
      const data = JSON.parse(v);
      if (data && data.capture && data.capture.enable && data.capture.url) {
        uploadUrl.callback = () => Promise.resolve(data.capture.url);
        return data.capture.url;
      } else {
        uploadUrl.callback = () => Promise.reject('');
        return Promise.reject('disable capture: ' + v);
      }
    });
  }
  return Promise.reject('disable capture');
}
