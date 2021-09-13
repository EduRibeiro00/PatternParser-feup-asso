import { IPlainTextAuthorStrategy } from './IPlainTextAuthorStrategy';
import { Author } from '../../../ParserUtils';

class PlainTextColumnAuthorStrategy implements IPlainTextAuthorStrategy {
    public parseAuthors(file: string, url : string) : Author[] {
        // TODO: parse file
        return [
            {
                "name": "Philippe Kruchten",
                "email": "author@email.com",
                "organization": "FEUP",
                "country": "Germany",
            }
        ];
    }
}

export { PlainTextColumnAuthorStrategy }