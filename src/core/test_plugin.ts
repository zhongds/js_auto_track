export default class TestPlugin implements IBasePlugin {
  name: string = "test_plugin";

  client: ITrackClient;
  setup(client: ITrackClient): void {
    client = client;
    client.beforeReport(this.filter);
  }
  
  filter(msg) {

  }
}
