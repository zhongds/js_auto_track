export interface CallbackObj {
  onSuccess(res: string): void;
  onError(err: string): void;
}
export function get(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
  
    xhr.onload = () => {
      // Request finished. Do processing here.
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText);
      } else {
        reject(xhr.responseText);
      }
    };
  
    xhr.send(null);
  })
}

export interface IPostOption {
  body: XMLHttpRequestBodyInit|null,
  header?: {
    [key: string]: string,
  },
}

export function post(url: string, option?: IPostOption): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
  
    //Send the proper header information along with the request
    let isSetContentType = false;
    if (option && option.header) {
      Object.keys(option.header).forEach(k => {
        xhr.setRequestHeader(k, option.header[k]);
        if (k.toLowerCase() === 'content-type') {
          isSetContentType = true;
        }
      });
    }
    if (!isSetContentType) {
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    }
  
    xhr.onreadystatechange = () => { // Call a function when the state changes.
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.responseText);
        } else {
          reject(xhr.responseText);
        }
      }
    }
    xhr.send(option && option.body);
  })
}