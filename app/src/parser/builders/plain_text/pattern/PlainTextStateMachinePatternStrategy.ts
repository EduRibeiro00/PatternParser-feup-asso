import { IPlainTextPatternStrategy } from './IPlainTextPatternStrategy';
import { SECTION_START_REGEX, SUBSECTION_START_REGEX, REGEX } from './readerRegex';
import { Pattern, getSHA256Hash } from '../../../ParserUtils';
import { StateMachine } from './StateMachine';

class PlainTextStateMachinePatternStrategy implements IPlainTextPatternStrategy {

    public parsePatterns(file: string, url : string) : Pattern[] {
        const lines = file.split('\n');

        const state_machine = new StateMachine();
        lines.forEach((line) => state_machine.execute(line));
    
        return state_machine.getParsedPatterns();
    }
}

/**
 * Paper types. They may contain only a single pattern or a list of patterns.
 */
 const PAPER_TYPES: { [key: string]: string } = Object.freeze({
    SINGLE_PATTERN: "SINGLE_PATTERN",
    MULTI_PATTERN: "MULTI_PATTERN",
});

/**
 * Pattern key renamings map to ensure correct output message keys naming
 */
const PATTERN_KEY_RENAMINGS: { [key: string]: string } = Object.freeze({
    intents: "intent",
    contexts: "context",
    problems: "problem",
    force: "forces",
    solutions: "solution",
    implementations: "implementation",
    known_use: "known_uses",
    consequence: "consequences",
    related_pattern: "related_patterns",
    alias: "aliases",
    resulting_contexts: "resulting_context",
    examples: "example",
    variant: "variants",
});

/**
 * PDF parsing state machine class
 */
class PlainTextParserStateMachine {
    private STATE_ACTIONS: any;
    private MIDDLEWARES: any[];
    private patterns: Pattern[]; // list of patterns that is going to be returned

    private curState: string; // string indicating the current state
    private curPattern: Pattern; // current pattern being processed
    private paper_type: string;
    private paper_title: string;
    private stateStack: string[];

    constructor(pdf_url: string) {
        this.updateState = this.updateState.bind(this);
        this.initNewPattern = this.initNewPattern.bind(this);
        this.trimPatterns = this.trimPatterns.bind(this);
        this.renamePatternsFields = this.renamePatternsFields.bind(this);

        this.STATE_ACTIONS = Object.freeze({
            TITLE: this.titleAction.bind(this),
            INTRODUCTION: this.introductionAction.bind(this),
            INTENT: this.sectionAction.bind(this),
            CONTEXT: this.sectionAction.bind(this),
            PROBLEM: this.sectionAction.bind(this),
            FORCES: this.sectionAction.bind(this),
            SOLUTION: this.sectionAction.bind(this),
            IMPLEMENTATION: this.sectionAction.bind(this),
            KNOWN_USES: this.sectionAction.bind(this),
            CONSEQUENCES: this.sectionAction.bind(this),
            RELATED_PATTERNS: this.sectionAction.bind(this),
            ALIASES: this.sectionAction.bind(this),
            RESULTING_CONTEXT: this.sectionAction.bind(this),
            EXAMPLES: this.sectionAction.bind(this),
            VARIANTS: this.sectionAction.bind(this),
            SKIP: this.skipAction.bind(this),
        });

        this.MIDDLEWARES = [
            this.verifyMultiPatternPaper.bind(this),
            this.verifyMultiPatternPatternStart.bind(this),
            this.verifySectionStart.bind(this),
            this.verifyDocumentTermination.bind(this),
            this.verifyEmptyLine.bind(this),
            this.verifyFrontPageFooterStart.bind(this),
            this.verifyFrontPageFooterEnd.bind(this),
            this.verifyPageFooter.bind(this),
            this.verifyImageLabel.bind(this),
        ];

        this.paper_type = PAPER_TYPES.SINGLE_PATTERN;
        this.patterns = [];

        this.paper_title = "";
        this.curState = "";
        this.stateStack = [];

        this.curPattern = this.createPatternObj();
        this.initNewPattern();
        
        this.updateState("TITLE");
    }

    /**
     * Updates the current state machine status based on the received text line (event)
     *
     * @param {String} line PDF file text line
     */
     public update(line: string) : void {
        const trimmed_line = line.trim();

        for (const middleware of this.MIDDLEWARES) {
            if (middleware(trimmed_line)) {
                return;
            }
        }

        this.STATE_ACTIONS[this.curState](trimmed_line);
    }

    /**
     * Returns all the patterns extracted by the state machine
     */
    public getPatterns(): Pattern[] {
        if (this.patterns.length === 1) {
            // in papers with only one pattern, the papers's title is the pattern's name
            this.patterns[0].name = this.paper_title;
        } else {
            // in papers with multiple pattern, the introduction is to the paper and not to any of the patterns
            for (const pattern of this.patterns) {
                pattern.introduction = "";
            }
        }

        this.trimPatterns();
        this.renamePatternsFields();

        return this.patterns;
    }

    private createPatternObj() : Pattern {
        return {
            "name": "",
            "introduction": "",
            "intent": "",
            "context": "",
            "problem": "",
            "forces": "",
            "solution": "",
            "implementation": "",
            "known_uses": "",
            "consequences": "",
            "related_patterns": "",
            "aliases": "",
            "resulting_context": "",
            "examples": "",
            "variants": ""
        };
    }

    /**
     * Initializes a new pattern to be 'populated' with data extracted from the pdf file content
     */
    private initNewPattern() {
        this.curPattern = this.createPatternObj();
        this.patterns.push(this.curPattern);
    }

    /**
     * Trims certain fields, to ensure output consistency (to fix pdf parser inconsistency with different paper formats)
     */
    private trimPatterns() {
        for (const pattern of this.patterns) {
            for (const patternKey of Object.keys(pattern)) {
                const key = patternKey as keyof typeof pattern;

                if (typeof pattern[key] === "string") {
                    pattern[key] = pattern[key].trim();
                    if (pattern[key][0] === ".") {
                        pattern[key] = pattern[key].substr(1);
                    }
                }
            }
        }
    }

    /**
     * Renames pattern keys to ensure correct output message keys naming
     */
    private renamePatternsFields() {
        for (const pattern of this.patterns) {
            for (const patternKey of Object.keys(pattern)) {
                const key = patternKey as keyof typeof pattern;

                if (PATTERN_KEY_RENAMINGS[key]) {
                    const new_key_name = PATTERN_KEY_RENAMINGS[key] as keyof typeof pattern;
                    pattern[new_key_name] = pattern[key];
                    delete pattern[key];
                }
            }
        }
    }

    /**
     * Handles 'title' state events
     *
     * @param {String} line PDF file text line
     */
    private titleAction(line: string) {
        this.paper_title = line;
        this.updateState("SKIP");
    }

    /**
     * Handles 'introduction' state events
     *
     * @param {String} line PDF file text line
     */
    private introductionAction(line: string) {
        if (REGEX.INTRODUCTION_END.test(line)) {
            this.updateState("SKIP");
        } else {
            this.curPattern.introduction += line;
        }
    }

    /**
     * Handles a section's state events
     *
     * @param {String} line PDF file text line
     */
    private sectionAction(line: string) {
        const patternCopy = this.curPattern;
        const section = this.curState.toLowerCase() as keyof typeof patternCopy;

        // ensure there's a blank space in line changes (not detect by pdf reader)
        const section_content = this.curPattern[section];

        if (section_content.length > 0) {
            const last_char = section_content[section_content.length - 1];
            if (last_char !== " " && line[0] !== " ") {
                this.curPattern[section] += " ";
            }
        }

        this.curPattern[section] += line;
    }

    /**
     * Stub function to ignore a received pdf file line
     *
     * @param {String} line PDF file text line
     */
    private skipAction(line: string) {}

    /**
     * Empty line verifier
     *
     * @param {String} line PDF file text line
     *
     * @returns {Boolean} True if empty, false otherwise
     */
    private verifyEmptyLine(line: string) {
        return line.length === 0;
    }

    /**
     * Section start verifier
     *
     * @param {String} line PDF file text line
     *
     * @returns {Boolean} True if section start, false otherwise
     */
    private verifySectionStart(line: string) {
        const regex_list = (this.paper_type === PAPER_TYPES.SINGLE_PATTERN)
            ? Object.entries(SECTION_START_REGEX)
            : Object.entries(SUBSECTION_START_REGEX);

        for (const [section, regex] of regex_list) {
            if (regex.test(line)) {
                this.updateState(section);

                if (this.paper_type === PAPER_TYPES.MULTI_PATTERN) {
                    const matches = line.match(regex);
                    if (matches && matches[1]) {
                        this.sectionAction(matches[1]);
                    }
                }

                return true;
            }
        }
        return false;
    }

    /**
     * Page footer verifier
     *
     * @param {String} line PDF file text line
     *
     * @returns {Boolean} True if page footer, false otherwise
     */
    private verifyPageFooter(line: string) {
        return REGEX.PAGE_NUMBERING_FOOTER.test(line);
    }

    /**
     * Image label verifier
     *
     * @param {String} line PDF file text line
     *
     * @returns {Boolean} True if image label, false otherwise
     */
    private verifyImageLabel(line: string) {
        return REGEX.FIGURE_LABEL.test(line);
    }

    /**
     * Document termination verifier
     *
     * @param {String} line PDF file text line
     *
     * @returns {Boolean} True if document termination was reached, false otherwise
     */
    private verifyDocumentTermination(line: string) {
        if (REGEX.EOF.test(line)) {
            this.updateState("SKIP");
            return true;
        }
        return false;
    }

    /**
     * Front page footer (different than regular page footers) start verifier
     *
     * @param {String} line PDF file text line
     *
     * @returns {Boolean} True if front page footer start, false otherwise
     */
    private verifyFrontPageFooterStart(line: string) {
        if (REGEX.FRONT_PAGE_FOOTER_START.test(line)) {
            this.updateState("SKIP");
            return true;
        }
        return false;
    }

    /**
     * Front page footer ending verifier
     *
     * @param {String} line PDF file text line
     *
     * @returns {Boolean} True if front page footer ending, false otherwise
     */
    private verifyFrontPageFooterEnd(line: string) {
        if (REGEX.FRONT_PAGE_FOOTER_END.test(line)) {
            this.curPattern.introduction += " ";
            this.updateState("INTRODUCTION");
            return true;
        }
        return false;
    }

    /**
     * Multi-pattern paper type verifier
     *
     * @param {String} line PDF file text line
     *
     * @returns {Boolean} True if multi-pattern paper detected, false otherwise
     */
    private verifyMultiPatternPaper(line: string) {
        if (REGEX.MULTI_PATTERN_SECTION.test(line)) {
            this.paper_type = PAPER_TYPES.MULTI_PATTERN;
            return true;
        }
        return false;
    }

    /**
     * Start of multi-pattern paper verifier
     *
     * @param {String} line PDF file text line
     *
     * @returns {Boolean} True if multi-pattern paper detected, false otherwise
     */
    private verifyMultiPatternPatternStart(line: string) {
        if (this.paper_type !== PAPER_TYPES.MULTI_PATTERN) {
            return false;
        }

        const matches = line.match(REGEX.MULTI_PATTERN_PATTERN_TITLE1);

        if (matches) {
            if (this.patterns[this.patterns.length - 1].name.length !== 0) {
                this.initNewPattern();
            }
            this.curPattern.name = matches[1];
            return true;
        }
        return false;
    }

    /**
     * Updates the current state, pushing it to the visited state's stack
     *
     * @param {String} state New state
     */
    private updateState(state: string) {
        this.curState = state;
        this.stateStack.push(this.curState);
    }
}

export { PlainTextStateMachinePatternStrategy }