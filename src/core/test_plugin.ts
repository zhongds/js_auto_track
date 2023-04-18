export default class TestPlugin implements IBasePlugin {
  name: string = "test_plugin";

  client: ITrackClient;
  option: object;
  setup(client: ITrackClient, option?: object): void {
    client = client;
    option = option;
    client.beforeReport(this.filter);
  }
  
  filter(msg) {

  }
}
