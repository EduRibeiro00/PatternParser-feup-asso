import fs from 'fs';
import shell from 'shelljs';
import { getSHA256Hash } from '../ParserUtils';
import { IDownloadingStrategy } from './IDownloadingStrategy';
import { promisify } from 'util';

class WGetDownloadingStrategy implements IDownloadingStrategy {
    basePath: string;

    public constructor() {
        this.basePath = process.env.TEMP_FILE_PATH || '/tmp/downloads';
        if (!fs.existsSync(this.basePath)) {
            fs.mkdirSync(this.basePath);
        }
    }

    public async downloadFile(url : string) : Promise<any> {
        const path = this.basePath + this.getFilePath(url);
        const command = `wget -q ${url} -O ${path}`;
        shell.exec(command);
        return await promisify(fs.readFile)(path);
    }

    public async cleanup(url : string) : Promise<void> {
        return promisify(fs.unlink)(this.getFilePath(url));
    }

    private getFilePath(url: string) : string {
        return getSHA256Hash(url);
    }
}

export { WGetDownloadingStrategy }