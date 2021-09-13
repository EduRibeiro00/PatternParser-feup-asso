import { StateMachine, PAPER_TYPES } from "../StateMachine";
import { SECTION_START_REGEX, SUBSECTION_START_REGEX, REGEX } from '../readerRegex';
import { SectionState } from "./SectionState";
import { SkipState } from "./SkipState";
import { IntroductionState } from "./IntroductionState";

class Transition {
    public static stateTransitions = [
        Transition.verifyMultiPatternPaper,
        Transition.verifyMultiPatternPatternStart,
        Transition.verifySectionStart,
        Transition.verifyDocumentTermination,
        Transition.verifyEmptyLine,
        Transition.verifyNonPatternTitle,
        Transition.verifyFrontPageFooterStart,
        Transition.verifyFrontPageFooterEnd,
        Transition.verifyPageFooter,
        Transition.verifyImageLabel,
    ];

    private static verifyEmptyLine(context: StateMachine, line: string) {
        return line.length === 0;
    }

    private static verifySectionStart(context: StateMachine, line: string) {
        const regex_list = (context.getPaperType() === PAPER_TYPES.SINGLE_PATTERN)
            ? Object.entries(SECTION_START_REGEX)
            : Object.entries(SUBSECTION_START_REGEX);

        for (const [section, regex] of regex_list) {
            if (regex.test(line)) {
                context.setState(new SectionState(context, section));

                if (context.getPaperType() === PAPER_TYPES.MULTI_PATTERN) {
                    const matches = line.match(regex);
                    if (matches && matches[1]) {
                        context.getState().execute(matches[1]);
                    }
                }

                return true;
            }
        }
        return false;
    }

    private static verifyPageFooter(context: StateMachine, line: string) {
        return REGEX.PAGE_NUMBERING_FOOTER.test(line);
    }

    private static verifyImageLabel(context: StateMachine, line: string) {
        return REGEX.FIGURE_LABEL.test(line);
    }

    private static verifyDocumentTermination(context: StateMachine, line: string) {
        if (REGEX.EOF.test(line)) {
            context.setState(new SkipState(context));
            return true;
        }
        return false;
    }

    private static verifyFrontPageFooterStart(context: StateMachine, line: string) {
        if (REGEX.FRONT_PAGE_FOOTER_START.test(line)) {
            context.setState(new SkipState(context));
            return true;
        }
        return false;
    }

    private static verifyFrontPageFooterEnd(context: StateMachine, line: string) {
        if (REGEX.FRONT_PAGE_FOOTER_END.test(line)) {
            context.setState(new IntroductionState(context));
            return true;
        }
        return false;
    }

    private static verifyNonPatternTitle(context: StateMachine, line: string) {
        if (REGEX.NON_PATTERN_TITLE.test(line)) {
            context.setState(new SkipState(context));
            return true;
        }
        return false;
    }


    private static verifyMultiPatternPaper(context: StateMachine, line: string) {
        if (REGEX.MULTI_PATTERN_SECTION.test(line)) {
            context.setPaperType(PAPER_TYPES.MULTI_PATTERN);
            context.setState(new SkipState(context));
            return true;
        }
        return false;
    }

    private static verifyMultiPatternPatternStart(context: StateMachine, line: string) {
        if (context.getPaperType() !== PAPER_TYPES.MULTI_PATTERN) {
            return false;
        }

        let matches = line.match(REGEX.MULTI_PATTERN_PATTERN_TITLE1);
        if(!matches) matches = line.match(REGEX.MULTI_PATTERN_PATTERN_TITLE2);

        if (matches) {
            if (context.getCurrentPattern().name.length !== 0) {
                context.createNewPattern();
            }
            context.getCurrentPattern().name = matches[1];
            return true;
        }
        return false;
    }
}

export { Transition };