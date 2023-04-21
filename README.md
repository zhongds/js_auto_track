# js_auto_track
js的无痕埋点

## sdk目录结构
```js
config: 配置以及一些常量
core: sdk核心代码, 提供api接口
models: 功能模块
plugins: 插件目录
requests: 请求配置
typings: 全局类型
utils：工具类
test: 单元测试
```

## 打包说明
sdk打包输出会主要分成三块：
1. 集成了预置插件的js：内置常用的插件
2. 只含基础功能的js（mini版）：适用于对体积有要求，希望自定义功能的业务
3. 插件包

## 功能说明
功能都是插件化，插件功能最终是以事件的形式上报给服务端

### 例子
```js
import RegisterPlugin from 'auto_track_js/plugins/register_plugin';
import {createClient} from 'auto_track_js';

const client = createClient({});

// 插件加载需要在init之前
client.use(RegisterPlugin, {});
client.use(otherPlugin);

client.init({...})

```

### client说明
1. TrackClient定义如下：除了功能接口还可以通过监听拦截来扩展功能
```js
/**
 * 核心Api
 */
interface ITrackClient extends IEventEmitter, ICommonMessager, IHooker {
  version: string;
  config: IConfig;
  init(option: IOption): void;
  use(plugin: IBasePlugin): void;
  toReport(msg: ICommonMessage);
}

// 监听
interface IEventEmitter {
  on(k: string, fn: Function);
  once(k: string, fn: Function);
  emit(k: string, ...rets);
  off(k: string, fn: Function);
}
// 拦截
interface IHooker {
  hook(k: string, fn: IHookBeforeReport): void;
  removeHook(k: string, fn: Function): void;
  triggerHook(k: string, ...args): ICommonMessage|Falsy;
}

interface ICommonMessager {
  // 获取通用内置属性
  getCommonMessage(eventType: EventType|APMType): ICommonMessage|Falsy;
}

/**
 * sdk的生命周期, 可监听
 */
export const CLIENT_LIFECYLE_EVENT = {
  INIT: 'init', // 初始化本地配置
  REMOTE_CONFIG_CHANGED: 'remote_config_changed', // 拉取远端配置后触发，可拿到新旧配置
  START: 'start', // 加载各种插件
  BEFORE_BUILD: 'before_build', // 生成事件信息，触发时机：获取到commonMessage的时候
  BEFORE_REPORT: 'before_report', // 上报之前
}

/**
 * 可拦截事件，修改上报的数据或不上报
 */
export const CLIENT_HOOK_EVENT = {
  BEFORE_BUILD: 'before_build', // 事件生成之前，可以拿到基础的事件信息，返回Falsy不上报
  BEFORE_REPORT: 'before_report', // 事件上报前，可以拿到即将上报的数据，返回Falsy不上报
}
```


### 插件说明
1. 插件定义：
```js
interface IBasePlugin {
  /**
   * 插件名，唯一，必须
   */
  name: string;
  /**
   * 安装插件（多次调用，只安装一次），必须
   * @param client client实例
   * @param option 
   * @returns true-正常安装 false-已经安装过了
   */
  setup(client: ITrackClient, option?: object): boolean;
  /**
   * 卸载插件（插件卸载有副作用需要实现这个方法），可选
   */
  destroy(): void;
}
```
2. 插件启动
插件会在sdk初始化后启动

3. 插件通过client实例跟sdk交互
