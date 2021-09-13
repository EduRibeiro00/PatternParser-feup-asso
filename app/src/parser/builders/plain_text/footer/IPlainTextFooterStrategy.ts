import { PaperInfo } from '../../../ParserUtils';

interface IPlainTextFooterStrategy {
    parseFooter(file: string, url : string) : PaperInfo;
}

export { IPlainTextFooterStrategy }