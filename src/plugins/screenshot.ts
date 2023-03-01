import domToImage from 'dom-to-image-more';
import { Config } from '../config/config';
import TrackLog from './log';

/**
 * 生成截图
 * @param name 文件名
 * @param node 截图的节点
 * @returns 
 */
export function genScreenshot(name: string, node: Element) {
  if (!node || !(node instanceof Element)) return;
  const key = 'credentials_XVJVzaJv8vKHzVCk'; // TODO 先写死了内网可上传图片
  try {
    const credStr = localStorage.getItem(key);
    const cred = JSON.parse(credStr);
    if (Config.capture && cred.access_token) {
      domToImage.toBlob(node)
        .then(function (blob) {
          TrackLog.log('图片', blob);
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `https://2rvk4e3gkdnl7u1kl0k.xbase.xyz/v1/file/personalmaidian/${name}.png`);
          xhr.setRequestHeader('Content-Type', 'image/png')
          xhr.setRequestHeader('Authorization', 'Bearer ' + cred.access_token);
          xhr.send(blob);
        })
        .catch(function (error) {
          TrackLog.error('oops, something went wrong!', error);
        });
    }
  } catch (error) {
    TrackLog.error('生成上传图片报错', error);
  }
}
