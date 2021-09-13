import { StateMachine } from "../StateMachine";
import { State } from "./State";

class SectionState extends State {
    private sectionType: string;

    constructor(context: StateMachine, sectionType: string) {
        super(context);
        this.sectionType = sectionType;
    }

    public execute(line: string): void {
        const patternCopy = this.context.getCurrentPattern();
        const section = this.context.getState().toString().toLowerCase() as keyof typeof patternCopy;

        // ensure there's a blank space in line changes (not detect by pdf reader)
        const section_content = this.context.getCurrentPattern()[section];

        if (section_content.length > 0) {
            const last_char = section_content[section_content.length - 1];
            if (last_char !== " " && line[0] !== " ") {
                this.context.getCurrentPattern()[section] += " ";
            }
        }

        this.context.getCurrentPattern()[section] += line;
    }

    public toString(): string {
        return this.sectionType;
    }
}

export { SectionState };