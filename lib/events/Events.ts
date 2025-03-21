import { BuildEventContext } from "../bin/commands/build"
import { RunEventContext } from "../bin/commands/run";

export interface TyphonEvents {

    build: [ctx: BuildEventContext];
    run: [ctx: RunEventContext];
    test: [];

}

export interface CancellableEvent {
    canceled?: boolean
}

export interface Events {

    onEvent<T extends keyof TyphonEvents>(eventName: T, ...args: TyphonEvents[T]): TyphonEvents[T];

}