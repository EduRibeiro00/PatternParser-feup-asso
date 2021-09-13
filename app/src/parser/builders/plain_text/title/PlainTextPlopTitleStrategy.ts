import { IPlainTextTitleStrategy } from "./IPlainTextTitleStrategy";
import { checkIfPlopEmail } from '../../../ParserUtils';

class PlainTextPlopTitleStrategy implements IPlainTextTitleStrategy {
    public parseTitle(file: string, url : string) : string {
        let title = '';

        const sentences = file.split('\n');
        for (const sentence of sentences) {
            const currentSentenceSplit = sentence.split(",");
            if(currentSentenceSplit.length < 2) {
                if (sentence.length) {
                    title = title.concat(sentence, ' ');
                }
                continue;
            }
            if(checkIfPlopEmail(sentence, currentSentenceSplit)) {
                break;
            }
            title = title.concat(sentence, ' ');
        }

        return title.trim().replace(/\s\s+/g, ' ');
    }
}

export { PlainTextPlopTitleStrategy }