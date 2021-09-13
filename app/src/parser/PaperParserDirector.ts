import fs from 'fs';
import YAML from 'yaml';
import { IObserver } from '../IObserver';
import { IDownloadingStrategy } from './downloading/IDownloadingStrategy';
import { 
    downloadingStratTypes, 
    parserBuilderTypes,
    titleStratTypes,
    authorStratTypes,
    abstractStratTypes,
    patternStratTypes,
    footerStratTypes,
} from './ParserUtils';
import { CommunicationManager } from '../CommunicationManager';
import { RecoveryManager } from '../RecoveryManager';

class PaperParserDirector implements IObserver {
    private downloadStrat: IDownloadingStrategy;
    private fileTypes: Array<any>;
    private outputTopics: Array<string>;

    public constructor() {
        const fileName = process.env.CONFIG_FILE || 'src/parser/config.yaml';
        const data : any = YAML.parse(fs.readFileSync(fileName, 'utf8'));
        this.outputTopics = process.env.OUTPUT_TOPICS?.split(',') || [];

        // parse downloading strategy
        this.downloadStrat = this.chooseType(data['downloading_strat'], downloadingStratTypes);

        // parse file types
        this.fileTypes = [];
        for (const fileType in data.types) {
            const fileTypeValue = data.types[fileType];
            const fileTypeObj : any = {};
            fileTypeObj['name'] = fileType;
            fileTypeObj['url_regex'] = new RegExp(fileTypeValue['url_regex']);
            
            const parserType : string = fileTypeValue['parser']['type'];
            fileTypeObj['builder'] = this.chooseType(parserType, parserBuilderTypes);
            fileTypeObj['title_strat'] = this.chooseType(fileTypeValue['parser']['title_strat'], titleStratTypes[parserType]);
            fileTypeObj['author_strat'] = this.chooseType(fileTypeValue['parser']['author_strat'], authorStratTypes[parserType]);
            fileTypeObj['abstract_strat'] = this.chooseType(fileTypeValue['parser']['abstract_strat'], abstractStratTypes[parserType]);
            fileTypeObj['pattern_strat'] = this.chooseType(fileTypeValue['parser']['pattern_strat'], patternStratTypes[parserType]);
            fileTypeObj['footer_strat'] = this.chooseType(fileTypeValue['parser']['footer_strat'], footerStratTypes[parserType]);

            this.fileTypes.push(fileTypeObj);
        }
    }

    private chooseType(type: any, typesObj: any) : any {
        return type in typesObj ? typesObj[type] : typesObj['default'];
    }

    public async notify(url: string) : Promise<void> {
        await this.parsePaper(url);
    }

    public async parsePaper(url: string): Promise<void> {
        console.log(`Started parsing of URL ${url}`);

        // download file
        console.log('Downloading file...')
        const file = await this.downloadStrat.downloadFile(url);
        console.log('File downloaded.')

        // find the paper type that was just received
        console.log('Identifying paper type...')
        const matchedFileTypes = this.fileTypes.filter(fileTypeObj => url.match(fileTypeObj['url_regex']));
        if (!matchedFileTypes.length) {
            console.log('The paper received did not match any of the available parsing types.');
            return;
        }
        const matchedFileType = matchedFileTypes[0];
        console.log(`Paper type identified: "${matchedFileType['name']}"`);

        // build the parser
        console.log('Building parser...')
        const parserBuilder = new matchedFileType['builder'](url, file);
        parserBuilder.setTitleStrategy(new matchedFileType['title_strat']());
        parserBuilder.setAuthorStrategy(new matchedFileType['author_strat']());
        parserBuilder.setAbstractStrategy(new matchedFileType['abstract_strat']());
        parserBuilder.setPatternStrategy(new matchedFileType['pattern_strat']());
        parserBuilder.setFooterStrategy(new matchedFileType['footer_strat']());
        console.log('Parser built.')

        // parse the file
        console.log('Parsing file...')
        const res = await parserBuilder.parsePaper(url);
        console.log(`Ended parsing.`);

        // output to all output queue topics
        this.outputTopics.forEach(topic => CommunicationManager.getInstance().publish(topic, res));
        RecoveryManager.getInstance().storeFinishedPaperParsing(url);
    }
}

export { PaperParserDirector }