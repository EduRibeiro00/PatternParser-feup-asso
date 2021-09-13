import { StateMachine } from "../StateMachine";
import { State } from "./State";
import { REGEX } from '../readerRegex';
import { SkipState } from "./SkipState";


class IntroductionState extends State {

    constructor(context: StateMachine) {
        super(context);
        context.getCurrentPattern().introduction += " ";
    }

    public execute(line: string): void {
        if (REGEX.INTRODUCTION_END.test(line)) {
            this.context.setState(new SkipState(this.context));
        } else {
            this.context.getCurrentPattern().introduction += line;
        }
    }

    public toString(): string {
        return "INTRODUCTION";
    }
}

export { IntroductionState };