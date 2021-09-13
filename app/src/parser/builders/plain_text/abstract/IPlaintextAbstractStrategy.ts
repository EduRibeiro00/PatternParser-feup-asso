import { Abstract } from '../../../ParserUtils';

interface IPlainTextAbstractStrategy {
    parseAbstract(file: string, url : string) : Abstract;
}

export { IPlainTextAbstractStrategy }