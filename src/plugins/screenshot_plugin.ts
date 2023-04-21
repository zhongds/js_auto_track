import domToImage from 'dom-to-image-more';
import { Config } from '../config/config';
import { getUserCommonProperty } from '../models/user_property';
import { IPostOption, post } from '../request/request';
import { getUploadUrl } from '../request/upload';
import TrackLog from '../models/log';
import { CLIENT_HOOK_EVENT } from '../config/constant';
import BasePlugin from './base_plugin';

export default class Screenshot extends BasePlugin{
  name: string = 'screenshot_plugin';
  setup(client: ITrackClient, option?: object): boolean {
    if (super.setup(client)) {
      client.on(CLIENT_HOOK_EVENT.BEFORE_REPORT, this.onBeforeReport);
    }
    return true;
  }

  onBeforeReport(evt: ICommonMessage) {
    if (!evt) return evt;
    this.genScreenshot(evt.$span_id);
  }

  /**
 * 生成截图
 * @param name 文件名
 * @param node 截图的节点
 * @returns 
 */
  genScreenshot(name: string) {
    const node = document.body;
    if (!node || !(node instanceof Element)) return;
    try {
      if (Config.capture) {
        getUploadUrl().then(uploadUrl => {
          return domToImage.toBlob(node).then(blob => {
            TrackLog.log('图片', blob);
  
            const userId = getUserCommonProperty('$user_id');
            const deviceId = getUserCommonProperty('$device_id');
            const url = `${uploadUrl}?user_id=${userId}&app_id=${Config.appId}&filename=${name}&device_id=${deviceId}`
            const params: IPostOption = {
              header: {
                'Content-Type': 'image/png',
              },
              body: blob,
            }
            return post(url, params);
          })
        }).then(() => {
          TrackLog.log('upload image success!');
        }).catch(function (error) {
          TrackLog.log('reject upload image: ', error);
        });
      }
    } catch (error) {
      TrackLog.error('生成上传图片报错', error);
    }
  }

}
