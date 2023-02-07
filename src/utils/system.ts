/**
 * 获取浏览器名称
 * @returns string
 */
 export function getBrowserName(): string{
  const userAgent = navigator.userAgent;
  if(userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1){
    return 'Opera';
  }
  else if(userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1){
    return 'IE';
  }
  else if(userAgent.indexOf("Edge") > -1){
     return 'Edge';
  }
  else if(userAgent.indexOf("Firefox") > -1){
     return 'Firefox';
  }
  else if(userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1){
    return 'Safari';
  }
  else if(userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1){
     return 'Chrome';
  }
  else if(!!window.ActiveXObject || "ActiveXObject" in window){
     return 'IE>=11';
  }
  else{
   return 'Unknown';
  }
}

/**
 * 获取浏览器版本
 * @returns string
 */
export function getBrowserVersion(): string {
  const Sys = {}; 
  const ua = navigator.userAgent.toLowerCase(); 
  let s; 
  (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
  (s = ua.match(/msie ([\d\.]+)/)) ? Sys.ie = s[1] : 
  (s = ua.match(/edge\/([\d\.]+)/)) ? Sys.edge = s[1] :
  (s = ua.match(/firefox\/([\d\.]+)/)) ? Sys.firefox = s[1] : 
  (s = ua.match(/(?:opera|opr).([\d\.]+)/)) ? Sys.opera = s[1] : 
  (s = ua.match(/chrome\/([\d\.]+)/)) ? Sys.chrome = s[1] : 
  (s = ua.match(/version\/([\d\.]+).*safari/)) ? Sys.safari = s[1] : 0; 
   // 根据关系进行判断
  if (Sys.ie) return ('IE: ' + Sys.ie); 
  if (Sys.edge) return ('EDGE: ' + Sys.edge);
  if (Sys.firefox) return ('Firefox: ' + Sys.firefox); 
  if (Sys.chrome) return ('Chrome: ' + Sys.chrome); 
  if (Sys.opera) return ('Opera: ' + Sys.opera); 
  if (Sys.safari) return ('Safari: ' + Sys.safari);
  return 'Unknown';
}

/**
 * 获取系统信息
 * @returns 
 */
export function getOsInfo() {
  const ua = navigator.userAgent.toLowerCase();
  const os = {
    name: 'Unknown',
    version: 'Unknown',
  };
  const MAP_EXP = {
    Weixin: /micromessenger/i,
    Mac: /(mac os x)\s+([\w_]+)/,
    Windows: /(windows nt)\s+([\w.]+)/,
    Ios: /(i(?:pad|phone|pod))(?:.*)cpu(?: i(?:pad|phone|pod))? os (\d+(?:[\.|_]\d+){1,})/,
    Android: /(android)\s+([\d.]+)/,
    Ipad: /(ipad).*os\s([\d_]+)/,
    Iphone: /(iphone\sos)\s([\d_]+)/,
  };
  for (let key in MAP_EXP) {
    const uaMatch = ua.match(MAP_EXP[key]);
    if (!!uaMatch &&) {
      os.name = key;
      os.version = key === 'Ios' ? uaMatch[2].replace(/_/g, '.') : uaMatch[2];
    }
  }
  return os;
}
