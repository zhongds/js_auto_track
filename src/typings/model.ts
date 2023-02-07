type EventType = '$element_click' | '$page_view' | '$page_leave' | '$config_reload';
type NetworkType = 'slow-2g' | '2g' | '3g' | '4g';
type ClickType = 'single_click' | 'double_click'

interface ICommonMessage {
  $event_id: EventType,
  $anonymous_id: string, // 加载时生成随机数，保存在localStorage，下次直接拿
  $time: number, // 当前时间戳
  $app_id?: string, // 初始化设置
  $category_id?: string, // 事件分类，手动设置
  $channel_id?: string, // 渠道id，初始化设置
  $page_id: string, // 没啥用
  $user_id: string, // 登录用户id，手动设置
  $session_id?: string, // 每次加载生成的随机数
  $device_id?: string,
  $guid?: string,
  $app_version?: string, // ?
  $sdk_type: string, // js
  $sdk_version: string, // sdk版本，编译打包的时候写进去
  $os: string, // 根据ua解析出来的信息
  $os_version: string, // 系统版本
  $os_language: string, // 系统语言
  $network_carrier?: string, // 网络运营商
  $network_type: string, // 网络类型
  $user_agent: string, // ua
  $browser: string, //浏览器
  $browser_version: string, // 浏览器版本
  $screen_width: number, // 屏幕宽度
  $screen_height: number, // 屏幕高度
  $viewpoint_width: number, // 视区宽度
  $viewpoint_height: number, // 视区高度
  $domain: string, // 域名
  $url: string, // location.href
  $referrer: string, // 上个页面地址
  $title: string, // 页面标题
}


interface IClickEventMessage extends ICommonMessage {
  $element_type: string, // 元素类型，如button，a等
  $element_id?: string, // 元素id
  $element_name?: string, // name属性
  $element_path?: string, // 元素selector
  $element_content?: string, // innerHtml
  $element_position?: string, // 位置信息，列表
  $click_type?: ClickType, // 单击/双击 
}

interface IPageViewMessage extends ICommonMessage {
  
}

interface IPageLeaveMessage extends ICommonMessage {
  $duration: number, // 时间戳，页面停留时长
}

