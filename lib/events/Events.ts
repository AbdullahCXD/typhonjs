import { BuildEventContext } from "../bin/commands/build"
import { RunEventContext } from "../bin/commands/run";

export type TyphonEvents = {

    build: [ctx: BuildEventContext];
    run: [ctx: RunEventContext];
    test: [];

}