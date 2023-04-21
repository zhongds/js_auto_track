export default class BasePlugin implements IBasePlugin {
  _setuped: boolean = false;
  name: string;
  client: ITrackClient;
  setup(client: ITrackClient, option?: object): boolean {
    if (this._setuped) return false;
    this._setuped = true;
    this.client = client;
    return true;
  }
  destroy(): void {
    this._setuped = false;
    this.client = null;
  }
  
}


