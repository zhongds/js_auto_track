import domToImage from 'dom-to-image-more';
import { Config } from '../config/config';
import GlobalWorker from './global_worker';

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
    if (Config.enableScreenShot && cred.access_token) {
      domToImage.toBlob(node)
        .then(function (blob) {
          console.log('图片', blob);

          const worker = GlobalWorker.getInstance();
          worker.postAutoMessage({
            message: {cmd: 'upload', params: {file: blob, name, token: cred.access_token}},
            callback: (e) => {
              console.log('上传图片结果: ', e.data);
            }
          })
        })
        .catch(function (error) {
          console.error('oops, something went wrong!', error);
        });
    }
  } catch (error) {
    console.error('生成上传图片报错', error);
  }
}

