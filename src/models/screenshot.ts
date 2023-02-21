import domToImage from 'dom-to-image-more';
import { Config } from '../config/config';

export function genScreenshot(node: Element) {
  if (!node || !(node instanceof Element)) return;
  if (Config.enableScreenShot) {
    domToImage.toPng(node)
      .then(function (dataUrl) {
        console.log('图片', dataUrl);
      })
      .catch(function (error) {
        console.error('oops, something went wrong!', error);
      });
  }
}
