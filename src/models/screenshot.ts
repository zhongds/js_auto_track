import domToImage from 'dom-to-image-more';
import { Config } from '../config/config';

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
          if (window.navigator && "function" == typeof window.navigator.sendBeacon ) {
            const url = 'https://2rvk4e3gkdnl7u1kl0k.xbase.xyz/fn/upload/5yrcemb';

            const form = new FormData();
            form.append('image', blob);
            form.append('token', cred.access_token);
            form.append('filename', name);
            window.navigator.sendBeacon(url, form);
          } else {
            const url = `https://2rvk4e3gkdnl7u1kl0k.xbase.xyz/v1/file/personalmaidian/${name}.png`;
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url);
            xhr.setRequestHeader('Content-Type', 'image/png')
            xhr.setRequestHeader('Authorization', 'Bearer ' + cred.access_token);
            xhr.send(blob);
          }
        })
        .catch(function (error) {
          console.error('oops, something went wrong!', error);
        });
    }
  } catch (error) {
    console.error('生成上传图片报错', error);
  }
}

