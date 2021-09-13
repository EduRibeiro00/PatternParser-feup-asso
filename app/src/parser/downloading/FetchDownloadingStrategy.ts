import fetch from "node-fetch";
import { IDownloadingStrategy } from './IDownloadingStrategy';

class FetchDownloadingStrategy implements IDownloadingStrategy {
    
    public async downloadFile(url : string) : Promise<any> {
        return (await fetch(url)).buffer();
    }

    public async cleanup(url : string) : Promise<void> {
        return Promise.resolve();
    }
}

export { FetchDownloadingStrategy }