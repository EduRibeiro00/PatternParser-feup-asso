import { PlainTextPlopTitleStrategy } from './builders/plain_text/title/PlainTextPlopTitleStrategy';
import { PlainTextColumnAuthorStrategy } from './builders/plain_text/author/PlainTextColumnAuthorStrategy';
import { PlainTextParagraphAuthorStrategy } from './builders/plain_text/author/PlainTextParagraphAuthorStrategy';
import { PlainTextPlopAbstractStrategy } from './builders/plain_text/abstract/PlainTextPlopAbstractStrategy';
import { PlainTextPlopFooterStrategy } from './builders/plain_text/footer/PlainTextPlopFooterStrategy';
import { PlainTextParserBuilder } from './builders/plain_text/PlainTextParserBuilder';
import { PlainTextStateMachinePatternStrategy } from './builders/plain_text/pattern/PlainTextStateMachinePatternStrategy';
import { FetchDownloadingStrategy } from './downloading/FetchDownloadingStrategy';
import { IDownloadingStrategy } from './downloading/IDownloadingStrategy';
import { WGetDownloadingStrategy } from './downloading/WGetDownloadingStrategy';
import CryptoJS from 'crypto-js';

// different downloading strategies
const downloadingStratTypes : { [key: string]: IDownloadingStrategy } = {
    'default': new FetchDownloadingStrategy(),
    'wget': new WGetDownloadingStrategy(),
    'fetch': new FetchDownloadingStrategy()
};

// different parser builder types
const parserBuilderTypes = {
    'default': PlainTextParserBuilder,
    'plain_text': PlainTextParserBuilder
};

// different title strategy types
const titleStratTypes : { [key: string]: any } = {
    'plain_text': {
        'default': PlainTextPlopTitleStrategy,
        'plop': PlainTextPlopTitleStrategy
    }
}

// different author strategy types
const authorStratTypes : { [key: string]: any } = {
    'plain_text': {
        'default': PlainTextParagraphAuthorStrategy,
        'paragraph': PlainTextParagraphAuthorStrategy,
        'column': PlainTextColumnAuthorStrategy
    }
}

// different abstract strategy types
const abstractStratTypes : { [key: string]: any } = {
    'plain_text': {
        'default': PlainTextPlopAbstractStrategy,
        'plop': PlainTextPlopAbstractStrategy,
    }
}

// different pattern strategy types
const patternStratTypes : { [key: string]: any } = {
    'plain_text': {
        'default': PlainTextStateMachinePatternStrategy,
        'state_machine': PlainTextStateMachinePatternStrategy
    }
};

// different footer strategy types
const footerStratTypes : { [key: string]: any } = {
    'plain_text': {
        'default': PlainTextPlopFooterStrategy,
        'plop': PlainTextPlopFooterStrategy
    }
}

// --------------------------------
// Pattern type

type Pattern = {
    name: string,
    introduction: string,
    intent: string,
    context: string,
    problem: string,
    forces: string,
    solution: string,
    implementation: string,
    known_uses: string,
    consequences: string,
    related_patterns: string,
    aliases: string,
    resulting_context: string,
    examples: string,
    variants: string,
};

// Author type
type Author = {
    name: string,
    email: string,
    organization: string,
    country: string,
};

// Abstract type
type Abstract = {
    text: string,
    categories: string[],
    general_terms: string[],
    keywords: string[],
    reference_format: string
};

// PaperInfo type
type PaperInfo = {
    url: string,
    conference_name: string,
    conference: string,
    conference_date: string,
    conference_location: string,
    copyright: string
};

// Main Paper Type
type Paper = {
    paper_id: string,
    paper_title: string,
    authors: Author[],
    abstract: Abstract,
    patterns: Pattern[],
    paper_info: PaperInfo
};

// --------------------------------
// Utility functions

const getSHA256Hash = (str: string) => CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex);

const standardizeFile = (file: string) => file.replace(/(\t| )+/g, ' ');

const checkIfPlopEmail = (str: string, strArray: string[]) => strArray[0] === strArray[0].replace(/[0-9]/g, '').toUpperCase() || str.indexOf("@") != -1

export { 
    downloadingStratTypes, 
    parserBuilderTypes,
    titleStratTypes,
    authorStratTypes,
    abstractStratTypes,
    patternStratTypes,
    footerStratTypes,
    Pattern,
    Author,
    Abstract,
    PaperInfo,
    Paper,
    getSHA256Hash,
    standardizeFile,
    checkIfPlopEmail
}