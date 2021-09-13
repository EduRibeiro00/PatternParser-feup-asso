import { Pattern } from '../../../ParserUtils';

interface IPlainTextPatternStrategy {
    parsePatterns(file: string, url : string) : Pattern[];
}

export { IPlainTextPatternStrategy }