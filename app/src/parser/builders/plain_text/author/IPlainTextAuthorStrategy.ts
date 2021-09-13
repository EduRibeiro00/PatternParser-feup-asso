import { Author } from '../../../ParserUtils';

interface IPlainTextAuthorStrategy {
    parseAuthors(file: string, url : string) : Author[];
}

export { IPlainTextAuthorStrategy }