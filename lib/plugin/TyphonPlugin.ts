import { CommandBase } from "../bin/CommandBase";
import { CommandRegistry } from "../commands/CommandRegistry";
import { Events, TyphonEvents } from "../events/Events";

export interface ResolvablePluginInformation {
    name: string;
    version: string;
}

export abstract class TyphonPlugin implements Events {

    constructor(private pluginInfo: ResolvablePluginInformation) {
    } 

    abstract load(): void;

    onEvent<T extends keyof TyphonEvents>(eventName: T, ...args: TyphonEvents[T]) {
        return args;
    }

    registerFreshCommand(command: CommandBase) {
        CommandRegistry.getInstance().registerCommand(command);
    }

    getPluginInformation() {
        return this.pluginInfo;
    }

}