import { StateMachine } from "../StateMachine";
import { SkipState } from "./SkipState";
import { State } from "./State";

class TitleState extends State {

    constructor(context: StateMachine) {
        super(context);
    }

    public execute(line: string): void {
        this.context.setPaperTitle(line);
        this.context.setState(new SkipState(this.context));
    }

    public toString(): string {
        return "TITLE";
    }
}

export { TitleState };