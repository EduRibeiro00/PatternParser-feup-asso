import { IParserBuilder } from '../IParserBuilder';
import { PlainTextParser } from './PlainTextParser';
import { Paper } from '../../ParserUtils';

class PlainTextParserBuilder implements IParserBuilder {
    private parser : PlainTextParser;

    constructor(url: string, file : any) {
        this.parser = new PlainTextParser(url, file);
    }
        
    public setTitleStrategy(titleStrategy : any) : void {
        this.parser.setTitleStrategy(titleStrategy);
    }

    public setAuthorStrategy(authorStrategy : any) : void {
        this.parser.setAuthorStrategy(authorStrategy);
    }

    public setAbstractStrategy(abstractStrategy : any) : void {
        this.parser.setAbstractStrategy(abstractStrategy);
    }

    public setPatternStrategy(patternStrategy: any) : void {
        this.parser.setPatternStrategy(patternStrategy);
    }

    public setFooterStrategy(footerStrategy : any) : void {
        this.parser.setFooterStrategy(footerStrategy);
    }

    public async parsePaper() : Promise<Paper> {
        return await this.parser.parsePaper();
    }

}

export { PlainTextParserBuilder }