
/**
 * 注册事件属性
 */

/**
 * 静态属性
 */
export interface IStaticProps {
  events: string[],
  properties: object,
}

class RegisterPlugin implements IBasePlugin {
  name: string = 'register_plugin';

  client: ITrackClient;
  setup(client: ITrackClient): void {
    this.client = client;
  }

  destroy(): void {
    
  }

  register(obj: IStaticProps) {
    if (!this.client || !obj) return;
    this.client.beforeReport()
  }

  hookRegister() {

  }
}

