import pdf_parse from 'pdf-parse';
import { IPlainTextAuthorStrategy } from "./author/IPlainTextAuthorStrategy"
import { IPlainTextFooterStrategy } from "./footer/IPlainTextFooterStrategy";
import { IPlainTextPatternStrategy } from "./pattern/IPlainTextPatternStrategy";
import { Paper, getSHA256Hash, standardizeFile, PaperInfo, Abstract } from '../../ParserUtils';
import { IPlainTextAbstractStrategy } from './abstract/IPlaintextAbstractStrategy';
import { IPlainTextTitleStrategy } from './title/IPlainTextTitleStrategy';

class PlainTextParser {
    private titleStrategy: IPlainTextTitleStrategy | null;
    private authorStrategy: IPlainTextAuthorStrategy | null;
    private abstractStrategy: IPlainTextAbstractStrategy | null;
    private patternStrategy: IPlainTextPatternStrategy | null;
    private footerStrategy: IPlainTextFooterStrategy | null;

    private url: string;
    private file: any;

    constructor(url : string, file : any) {
        this.titleStrategy = null;
        this.authorStrategy = null;
        this.abstractStrategy = null;
        this.patternStrategy = null;
        this.footerStrategy = null;

        this.url = url;
        this.file = file;
    }

    public async convertFile(file : any) : Promise<any> {
        const res = await pdf_parse(file);
        return res.text;
    }

    public setTitleStrategy(titleStrategy: IPlainTextTitleStrategy) : void {
        this.titleStrategy = titleStrategy;
    }

    public setAuthorStrategy(authorStrategy : IPlainTextAuthorStrategy) : void {
        this.authorStrategy = authorStrategy;
    } 

    public setAbstractStrategy(abstractStrategy : IPlainTextAbstractStrategy) : void {
        this.abstractStrategy = abstractStrategy;
    } 

    public setPatternStrategy(authorStrategy : IPlainTextPatternStrategy) : void {
        this.patternStrategy = authorStrategy;
    } 

    public setFooterStrategy(authorStrategy : IPlainTextFooterStrategy) : void {
        this.footerStrategy = authorStrategy;
    } 

    public async parsePaper() : Promise<Paper> {
        // convert file to plain text
        const fileContent = await this.convertFile(this.file);

        // create response object using parser strategies
        const res: Paper = {
            'paper_id': '',
            'paper_title': '',
            'authors': [],
            'abstract': {} as Abstract,
            'patterns': [],
            'paper_info': {} as PaperInfo
        };
        res.paper_id = getSHA256Hash(this.url);
        const standardizedFile = standardizeFile(fileContent);

        if (this.titleStrategy)
            res.paper_title = this.titleStrategy.parseTitle(standardizedFile, this.url);
        if (this.authorStrategy)
            res.authors = this.authorStrategy.parseAuthors(standardizedFile, this.url);
        if (this.abstractStrategy)
            res.abstract = this.abstractStrategy.parseAbstract(standardizedFile, this.url);
        if (this.patternStrategy)
            res.patterns = this.patternStrategy.parsePatterns(standardizedFile, this.url);
        if (this.footerStrategy)
            res.paper_info = this.footerStrategy.parseFooter(standardizedFile, this.url);

        return res;
    }

}

export { PlainTextParser }