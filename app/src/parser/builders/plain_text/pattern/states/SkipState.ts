import { StateMachine } from "../StateMachine";
import { State } from "./State";

class SkipState extends State {

    constructor(context: StateMachine) {
        super(context);
    }

    public execute(line: string): void {}

    public toString(): string {
        return "SKIP";
    }
}

export { SkipState };