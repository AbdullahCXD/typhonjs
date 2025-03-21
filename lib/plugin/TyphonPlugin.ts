import EventEmitter from "events";
import { CommandBase } from "../bin/CommandBase";
import { CommandRegistry } from "../commands/CommandRegistry";
import { TyphonEvents } from "../events/Events";
import { Awaitable } from "../types";

export interface ResolvablePluginInformation {
    name: string;
    version: string;
}

export abstract class TyphonPlugin extends EventEmitter<TyphonEvents> {

    constructor(private pluginInfo: ResolvablePluginInformation) {
        super();
    } 

    abstract load(): Awaitable<void>;

    registerFreshCommand(command: CommandBase) {
        CommandRegistry.getInstance().registerCommand(command);
    }

    getPluginInformation() {
        return this.pluginInfo;
    }

}