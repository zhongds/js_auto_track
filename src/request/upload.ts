import { Config } from "../config/config";
import { getUserProperty } from "../models/UserProperty";
import TrackLog from "../plugins/log";
import { post } from "./request";

const uploadUrl = '';
export function getUploadUrl(): Promise<string> {
  if (uploadUrl) return Promise.resolve(uploadUrl);
  if (Config.capture) {
    const url = Config.env === 'release' ? 'http://xldc.xunlei.com/config/v1/info' : 'http://xldc-test.xunlei.com/config/v1/info';
    const userId = getUserProperty('$user_id');
    const deviceId = getUserProperty('$device_id');
    if (!userId && !deviceId) {
      TrackLog.warn('user_id和device_id都不存在, 无法获取图片上传地址');
      return Promise.reject('lack user_id or device_id');
    }
    let params = userId ? {user_id: userId} : {device_id: deviceId};
    return post(url, params).then(v => {
      const data = JSON.parse(v);
      if (data && data.capture && data.capture.enable && data.capture.url) {
        return data.capture.url;
      } else {
        return Promise.reject('disable capture: ' + v);
      }
    });
  }
  return Promise.reject('disable capture');
}
