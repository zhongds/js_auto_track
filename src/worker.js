self.addEventListener('message', event => {
  const {cmd, params} = event.data;

  if (cmd !== 'upload' || typeof params !== 'object') {
    return;
  }

  const {file, name, token} = params;
  // 创建 XMLHttpRequest 对象
  const xhr = new XMLHttpRequest();

  // 监听 XMLHttpRequest 的 readyStateChange 事件
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      // 向主线程发送响应消息
      self.postMessage({
        status: xhr.status,
      });
    }
  };

  const url = `https://2rvk4e3gkdnl7u1kl0k.xbase.xyz/v1/file/personalmaidian/${name}.png`;
  xhr.open('POST', url);
  xhr.setRequestHeader('Content-Type', 'image/png')
  xhr.setRequestHeader('Authorization', 'Bearer ' + token);
  xhr.send(file);
});
