import domToImage from 'dom-to-image-more';
import { Config } from '../config/config';
import { getUserCommonProperty } from '../models/user_property';
import { IPostOption, post } from '../request/request';
import { getUploadUrl } from '../request/upload';
import TrackLog from './log';

/**
 * 生成截图
 * @param name 文件名
 * @param node 截图的节点
 * @returns 
 */
export function genScreenshot(name: string, node: Element) {
  if (!node || !(node instanceof Element)) return;
  try {
    if (Config.capture) {
      Promise.all([getUploadUrl, domToImage.toBlob(node)])
        .then(([uploadUrl, blob]) => {
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
          return post(url, params)
        }).then(() => {
          TrackLog.log('upload image success!');
        }).catch(function (error) {
          TrackLog.error('upload image wrong!', error);
        });
    }
  } catch (error) {
    TrackLog.error('生成上传图片报错', error);
  }
}

