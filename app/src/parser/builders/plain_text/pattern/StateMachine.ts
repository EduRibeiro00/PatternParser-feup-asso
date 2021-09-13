import { State } from "./states/State"
import { TitleState } from "./states/TitleState";
import { Pattern } from "../../../ParserUtils";
import { Transition } from "./states/Transition";

const PAPER_TYPES: { [key: string]: string } = Object.freeze({
    SINGLE_PATTERN: "SINGLE_PATTERN",
    MULTI_PATTERN: "MULTI_PATTERN",
});

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

class StateMachine {
    private state: State;
    private paper_type: string;
    private paper_title: string;
    private patterns: Pattern[]; // list of patterns that is going to be returned
    private current_pattern: Pattern;

    constructor() {
        this.paper_type = PAPER_TYPES.SINGLE_PATTERN;
        this.paper_title = '';
        this.patterns = [];
        this.current_pattern = this.getEmptyPatternObject();
        this.patterns.push(this.current_pattern);
        this.state = new TitleState(this);
    }

    public execute(line: string): void {
        const trimmed_line = line.trim();

        for (const transition of Transition.stateTransitions) {
            if (transition(this, trimmed_line)) {
                return;
            }
        }

        this.state.execute(trimmed_line);
    }

    public getState(): State {
        return this.state
    }

    public setState(state: State): void {
        this.state = state;
    }

    public getPaperTitle(): string {
        return this.paper_title;
    }

    public setPaperTitle(title: string): void {
        this.paper_title = title;
    }

    public getPaperType(): string {
        return this.paper_type;
    }

    public setPaperType(paper_type: string): void {
        this.paper_type = paper_type;
    }

    public getCurrentPattern(): Pattern {
        return this.patterns[this.patterns.length - 1];
    }

    public getEmptyPatternObject() : Pattern {
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

    public createNewPattern() {
        this.current_pattern = this.getEmptyPatternObject();
        this.patterns.push(this.current_pattern);
    }

    public getParsedPatterns(): Pattern[] {
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
        this.removeEmptyPatterns();
        this.replaceTabsWithSpaces();

        return this.patterns;
    }

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

    private removeEmptyPatterns() {
        let i = this.patterns.length;
        while(i--) {
            const pattern = this.patterns[i];
            let isEmpty = true;
            for (const patternKey of Object.keys(pattern)) {
                const key = patternKey as keyof typeof pattern;

                switch(key) {
                    case "name":
                        break;
                    default:
                        if(pattern[key] !== "") isEmpty = false;
                        break;
                }
            }

            if(isEmpty) this.patterns.splice(i, 1);
        }
    }

    private replaceTabsWithSpaces() {
        for (const pattern of this.patterns) {
            for (const patternKey of Object.keys(pattern)) {
                const key = patternKey as keyof typeof pattern;
                pattern[key] = pattern[key].replace('\t', ' ');
            }
        }
    }
}

export { StateMachine, PAPER_TYPES }