import { CommandBase, SectionType } from "../bin/CommandBase";
import Collection from "../utils/Collection";
import { StringUtils } from "../utils/StringUtils";


export class CommandRegistry {

    private static instance: CommandRegistry;

    public static getInstance() {
        if (!this.instance) this.instance = new CommandRegistry();
        return this.instance;
    }

    private commandMap: Collection<string, CommandBase<SectionType>> = new Collection();

    constructor() {
        this.clear();
    }

    clear() {
        this.commandMap = new Collection();
    }

    registerCommand(command: CommandBase) {
        this.commandMap.set(command.getName(), command);
    }

    getTyphCommands() {
        return this.commandMap.filter((v, k) => (v as CommandBase<SectionType>).getSection() == "typh");
    }

    getTyphonCommands() {
        return this.commandMap.filter((v, k) => (v as CommandBase<SectionType>).getSection() == "typhon");
    }

    getCommands() {
        return this.commandMap;
    }

    findCommand(name: string) { return this.commandMap.find(v => StringUtils.equals(v.getName(), name, true) )}

    addDefaults(...commands: CommandBase<SectionType>[]) {
        for (const command of commands) {
            this.commandMap.set(command.getName(), command);
        }
        return this;
    }
}