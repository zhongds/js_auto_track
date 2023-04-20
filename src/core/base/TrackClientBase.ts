export default class TrackClientBase implements ITrackClient {
  version: string;
  init(option: IOption): void {
    
  }
  use(plugin: IBasePlugin): void {
    throw new Error("Method not implemented.");
  }
  beforeReport(fn?: any): void {
    throw new Error("Method not implemented.");
  }
  
}

