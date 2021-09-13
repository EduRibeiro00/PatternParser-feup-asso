import { StateMachine } from "../StateMachine";


abstract class State {
    protected context: StateMachine;

    constructor(context: StateMachine) {
        this.context = context;
    }

    public abstract execute(line: string): void;

    public abstract toString(): string;
}

export { State };