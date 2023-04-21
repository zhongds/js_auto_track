type EventType = '' | '$element_click' | '$page_view' | '$page_leave' | '$config_reload' | '$user_defined';
type NetworkType = 'slow-2g' | '2g' | '3g' | '4g';
type ClickType = 'single_click' | 'double_click';
type APMType = '$error' | '$resource_performance' | '$api';
type UserPropertyType = string | boolean | number | object | Function;
type ReportMessageType = string | boolean | number | object;
type UserMessage = {[key: string]: ReportMessageType};

interface ICommonMessage {
  $event_type: EventType | APMType;
  $anonymous_id: string; // 加载时生成随机数，保存在localStorage，下次直接拿
  $time: number; // 当前时间戳
  $app_id?: string; // 初始化设置
  $category_id?: string; // 事件分类，手动设置
  $channel_id?: string; // 渠道id，初始化设置
  $page_id: string; // 没啥用
  $user_id?: string; // 登录用户id，手动设置
  $session_id?: string; // 每次加载生成的随机数
  $user_session_id?: string; // 用户的sessionid
  $device_id?: string;
  $guid?: string;
  $app_version?: string; // ?
  $sdk_type: string; // js
  $sdk_version: string; // sdk版本，编译打包的时候写进去
  $os: string; // 根据ua解析出来的信息
  $os_version: string; // 系统版本
  $os_language: string; // 系统语言
  $network_carrier?: string; // 网络运营商
  $network_type: string; // 网络类型
  $user_agent: string; // ua
  $browser: string; //浏览器
  $browser_version: string; // 浏览器版本
  $screen_width: number; // 屏幕宽度
  $screen_height: number; // 屏幕高度
  $viewpoint_width: number; // 视区宽度
  $viewpoint_height: number; // 视区高度
  $domain: string; // 域名
  $url: string; // location.href
  $referrer: string; // 上个页面地址
  $title: string; // 页面标题
  $charset: string; // 页面编码
  $trace_id: string; // 
  $span_id: string; // 
  $parent_span_id: string; //
  [key: string]: ReportMessageType; // 业务自定义的属性
}


interface IClickEventMessage extends ICommonMessage {
  $element_type: string; // 元素类型，如button，a等
  $element_id?: string; // 元素id
  $element_name?: string; // name属性
  $element_path?: string; // 元素selector
  $element_content?: string; // innerHtml
  $element_position?: string; // 位置信息，列表
  $element_page_x?: number; // 点击的x位置, event.pageX
  $element_page_y?: number; // 点击的y位置, event.pageY
  $click_type?: ClickType; // 单击/双击
}

/**
 * 用户手动上报的自定义事件
 */
interface IUserDefinedEventMessage extends ICommonMessage {
  $event_name: string, // 只有用户自定义的事件才有
}

interface IPageViewMessage extends ICommonMessage {
  $performance: IPagePerformance;
  $duration: number; // 总耗时
}

interface IPageLeaveMessage extends ICommonMessage {
  $duration: number; // 时间戳，页面停留时长
}

interface IErrorMessage extends ICommonMessage {
  $err_msg?: string; // 信息
  $err_detail?: string; // 错误栈
  $err_file?: string; // 出错文件
  $err_line?: number; // 行
  $err_col?: number; // 列
}

interface IPagePerformance {
  $fmp: number; // 首屏时间
  $fpt: number; // 白屏时间
  $tti: number; // 首次可交互时间
  $ready: number; // HTML加载完成时间
  $load_on: number; // 页面完全加载时间
  $first_byte: number; // 首包时间
  $dns: number; // dns查询耗时
  $tcp: number; // tcp连接耗时
  $ttfb: number; // 请求响应耗时
  $trans: number; // 内容传输耗时
  $dom: number; // dom解析耗时
  $res: number; // 同步资源加载耗时
  $ssl_link: number; // SSL安全连接耗时
  $redirect: number; // 重定向时间
  $unloadTime: number; // 上一个页面的卸载耗时
  $duration: number; // 总耗时
}

interface IApiPerfMessage extends ICommonMessage, IApiPerfData {
  
}

interface IApiPerfData {
  $api_url: string;
  $api_begin: number; // 开始时间
  $api_duration: number; // 耗时
  $api_status: number; // 状态码
  $api_success: boolean; // 成功与否
  $api_msg?: string; // 失败把信息上报
}

interface IEventCapacity {
  enable: boolean; // 事件能力是否开启
}
interface IPageViewEventCapacity extends IEventCapacity {
  spa?: boolean; // 是否是单页应用，true-重写pushState和replaceState方法
  isPerf?: boolean; // 是否增加pv的performance上报
  include_pages?: string[];
  exclude_pages?: string[];
}
// 跟pv绑定，单独开启不上报
interface IPageLeaveEventCapacity extends IEventCapacity {
  include_pages?: string[];
  exclude_pages?: string[];
}

interface IClickEventCapacity extends IEventCapacity {
  track_attr?: string[];
  element_types?: string[];
  include_pages?: string[];
  exclude_pages?: string[];
}

interface IResEventCapacity extends IEventCapacity {
  include_pages?: string[];
  exclude_pages?: string[];
}

interface IApiEventCapacity extends IEventCapacity{
  
}
interface IErrorEventCapacity extends IEventCapacity {
  
}

interface IEventMessageInterceptorOption {
  extend_props: {
    entry(msg: ICommonMessage) : {[key: string]: ReportMessageType}
  }
}

interface IRemoteConfigData {
  expires_in?: number;
  data?: string; // 加密脚本
  v?: string; // 旧版本
  configs?: {
    nv?: string, // 新版本
    disableSDK?: boolean,
    disableDebugMode?: boolean, // 是否关闭debug模式
    /**
     * TODO 预留
     * -1： 开启全埋点
        0： 关闭全埋点
        1： 开启appstart(js没有)
        2： 开启append（js没有）
        4： 开启点击事件
        8： 开启pv事件
     */
  	autoTrackMode?: number,
    event_blacklist?: string[],
    // TODO 预留
    effect_mode?: 1 | 0, // 0- 立马生效 1-下次生效
  }
}

interface IOption {
  appId: string; //
  secret: string; // 密钥
  reportUrl: string; //上报地址
  remoteConfigUrl: string; // 远端配置地址
  log?: boolean|number; // 是否打印日志或者设置最低的日志级别：1-log, 2-info, 3-warn, 4-error
  env?: 'dev'|'release';
  storage?: IStorage;
  enable?: boolean; // 是否开启，默认true
  capture?: boolean; // 是否截图
  event_blacklist?: string[]; // 黑名单事件列表，配置后会禁止采集这些事件
}

interface IConfig extends IOption {
  pv?: IPageViewEventCapacity;
  click?: IClickEventCapacity;
  api?: IApiEventCapacity;
  error?: IErrorEventCapacity;
  res?: IResEventCapacity;
  page_leave?: IPageLeaveEventCapacity;
}

/**
 * 事件接口
 */
interface EventItem {
  once: boolean;
  listener: Function;
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
 * 接口
 */
interface ITrackClient extends IEventEmitter, ICommonMessager, IHooker {
  version: string;
  config: IConfig;
  init(option: IOption): void;
  use(plugin: IBasePlugin): void;
  
  /**
   * 上报接口
   * @param msg 
   */
  toReport(msg: ICommonMessage);
}

interface IPluginItem {
  plugin: IBasePlugin;
  option?: object;
}

interface IPluginManager {
  add(plugin: IBasePlugin, option?: object);
  remove(name: string): void;
  getAllPlugins(): IPluginItem[];
}

interface IBasePlugin {
  /**
   * 插件名，唯一，必须
   */
  name: string;
  /**
   * 启动插件（多次调用，只启动一次），必须
   * @param client 
   * @param option 
   * @returns true-正常启动 false-已经安装过了
   */
  setup(client: ITrackClient, option?: object): boolean;
  /**
   * 卸载插件（插件卸载有副作用需要实现这个方法），可选
   */
  destroy(): void;
}

interface IUsePlugin {
  use(plugin: IBasePlugin, option?: any): IBasePlugin;
}

interface IReporter {
  report(data: ICommonMessage): void;
}

type Falsy = null|undefined|false;

type IHookBeforeReport = (data: ICommonMessage) => ICommonMessage|Falsy;
