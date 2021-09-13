import { Paper } from '../ParserUtils';

interface IParserBuilder {
    setTitleStrategy(titleStrategy : any) : void;
    setAuthorStrategy(authorStrategy : any) : void;
    setAbstractStrategy(abstractStrategy : any) : void;
    setPatternStrategy(patternStrategy: any) : void;
    setFooterStrategy(footerStrategy : any) : void;
    parsePaper() : Promise<Paper>;
}

export { IParserBuilder }