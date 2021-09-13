import { Abstract, checkIfPlopEmail } from '../../../ParserUtils';
import { IPlainTextAbstractStrategy } from './IPlaintextAbstractStrategy';

class PlainTextPlopAbstractStrategy implements IPlainTextAbstractStrategy {
    public parseAbstract(file: string, url : string) : Abstract {
        const preIntroduction = file.split(/1\.\s*Introduction/i)[0];
        let sentences = preIntroduction.split('\n');

        let abstractIndex = 0;

        for(let i = 0; i < sentences.length; i++) {
            let currentSentence = sentences[i];
            let currentSentenceSplit = currentSentence.split(",");

            if(currentSentenceSplit.length < 2) {
                continue;
            }

            if(checkIfPlopEmail(currentSentence, currentSentenceSplit)) {
                if(i < sentences.length - 1) {
                    const nextSentence = sentences[i+1];
                    if(!checkIfPlopEmail(nextSentence, nextSentence.split(","))) {
                        if(nextSentence.length < currentSentence.length * 3 / 4) {
                            i++;
                            abstractIndex = i + 1;
                        }else {
                            abstractIndex = i + 1;
                            break;
                        }
                    }
                }
            }
        }

        sentences = sentences.slice(abstractIndex);
        
        let rawAbstract = sentences.join(' ').trim();

        const data = {
            'text': '',
            'categories': [],
            'general_terms': [],
            'keywords': [],
            'reference_format': ''
        } as Abstract;

        const categoriesRegex = "(?:Categories and Subject Descriptors:)";
        const generalTermsRegex = "(?:General Terms:)";
        const keywordsRegex = "(?:Additional Key Words and Phrases:|Key words:)";
        const referenceFormatRegex = "(?:ACM Reference Format:|Reference Format:)";
        const regexAll = `(?:${categoriesRegex}|${generalTermsRegex}|${keywordsRegex}|${referenceFormatRegex})`;
        const createSectionRegex = (regex: string) => new RegExp(`(?:${regex}\\s(.*?)\\s(${regexAll}.*)|${regex}\\s(.*))`);
        const getArrayTerms = (str: string) => str.split(/\s*;|,\s*/).map(elem => elem.trim()).filter(elem => elem);

        // try to find abstract text
        const textData = new RegExp(`(.*?)\\s(${regexAll}.*)`).exec(rawAbstract);
        // if there is no match, whole abstract is text
        if (!textData || textData.length < 3) {
            data['text'] = rawAbstract;
            return data;
        }
        // else, separate the text and the rest
        data['text'] = textData[1].trim();
        rawAbstract = textData[2].trim();

        // check if categories are present in the document
        const categoriesData = createSectionRegex(categoriesRegex).exec(rawAbstract);
        // if there are categories, extract them
        if (categoriesData && categoriesData.length >= 4) {
            if (categoriesData[3]) {
                data['categories'] = getArrayTerms(categoriesData[3]);
                return data;
            }
            data['categories'] = getArrayTerms(categoriesData[1]);
            rawAbstract = categoriesData[2].trim();
        }
        
        // check if general terms are present in the document
        const generalTermsData = createSectionRegex(generalTermsRegex).exec(rawAbstract);
        // if there are general terms, extract them
        if (generalTermsData && generalTermsData.length >= 4) {
            if (generalTermsData[3]) {
                data['general_terms'] = getArrayTerms(generalTermsData[3]);
                return data;
            }
            data['general_terms'] = getArrayTerms(generalTermsData[1]);
            rawAbstract = generalTermsData[2].trim();
        }
        
        // check if keywords are present in the document
        const keywordsData = createSectionRegex(keywordsRegex).exec(rawAbstract);
        // if there are keywords, extract them
        if (keywordsData && keywordsData.length >= 4) {
            if (keywordsData[3]) {
                data['keywords'] = getArrayTerms(keywordsData[3]);
                return data;
            }
            data['keywords'] = getArrayTerms(keywordsData[1]);
            rawAbstract = keywordsData[2].trim();
        }
        
        // check if reference format are present in the document
        const referenceFormatData = new RegExp(`${referenceFormatRegex}(.*)`).exec(rawAbstract);
        // if there is reference format, extract it
        if (referenceFormatData && referenceFormatData.length >= 2) {
            data['reference_format'] = referenceFormatData[1].trim();
        }

        return data;
    }
}

export { PlainTextPlopAbstractStrategy }