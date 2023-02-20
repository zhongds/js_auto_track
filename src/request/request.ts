export interface CallbackObj {
  onSuccess(res: string): void;
  onError(err: string): void;
}
export function get(url: string, cb: CallbackObj) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);

  xhr.onload = () => {
    // Request finished. Do processing here.
    if (xhr.status >= 200 && xhr.status < 300) {
      cb.onSuccess(xhr.responseText);
    } else {
      cb.onError(xhr.responseText);
    }
  };

  xhr.send(null);
}

export function post(url: string, body: string, cb: CallbackObj) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);

  //Send the proper header information along with the request
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

  xhr.onreadystatechange = () => { // Call a function when the state changes.
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        cb.onSuccess(xhr.responseText);
      } else {
        cb.onError(xhr.responseText);
      }
    }
  }
  xhr.send(body);
}