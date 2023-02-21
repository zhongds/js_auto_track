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
  if (Config.enableScreenShot) {
    domToImage.toPng(node)
      .then(function (dataUrl) {
        console.log('图片', dataUrl);
        // TODO upload上传
      })
      .catch(function (error) {
        console.error('oops, something went wrong!', error);
      });
  }
}
