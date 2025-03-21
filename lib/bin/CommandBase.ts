import { Command, program } from "commander";
import { Awaitable } from "../types";
import { TyphonLogger } from "../TyphonLogger";

export type SectionType = "typh" | "typhon" | "both";
export interface CommandOptions {
    subcommands?: boolean
}

export abstract class CommandBase<Section extends SectionType = SectionType> {

    private command!: Command;
    private logger: TyphonLogger;

    constructor(private name: string, private description: string, private options?: CommandOptions) {
        this.logger = TyphonLogger.getInstance(`:${name}`);
    }

    getLogger() {
        return this.logger;
    }

    getSection(): Section {
        return "typhon" as Section;
    }

    register() {
        this.command = program
            .command(this.name)
            .description(this.description);
        
        if (!this.options?.subcommands) {
            this.command = this.command.action(async (...args: any[]) => {
                try {
                    await this.execute(...args);
                } catch (err) {
                    throw err;
                }
            });
        }

        return this.setupCommand();
    }

    setupCommand(): Command {
        return this.getCommand();
    }

    getCommand(): Command {
        return this.command
    }

    getName() {
        return this.name;
    }

    getDescription() {
        return this.description;
    }

    abstract execute(...args: any[]): Awaitable<void>;
}