import { Command } from "commander";
import { TyphRunner } from "../../runner/TyphRunner";
import { TyphonFile } from "../../types";
import { CommandBase, SectionType } from "../CommandBase";
import { inspect } from "fs-jetpack"
import { TyphonPluginManager } from "../../plugin/TyphonPluginManager";

export interface RunEventContext {

    performance: boolean;
    file: string;

}

export class RunCommand extends CommandBase<SectionType> {

    constructor() {
        super("run <file>", "Loads and runs a typh file");
    }

    getSection(): SectionType {
        return "typh";
    }

    setupCommand(): Command {
        return this.getCommand()
            .option("--performance", "Displays performance information");
    }

    async execute(file: string, options?: { performance?: boolean }): Promise<void> {
        if (!file.endsWith(`.typh`)) return this.getLogger().error("Unable to load typh file, invalid extension.");
        if (inspect(file)?.type == "dir") return this.getLogger().error("Unable to load typh file, cannot be directory.");

        const runner = new TyphRunner();
        const runnerContext: RunEventContext = {
            file: file,
            performance: options?.performance ?? false,
        }

        const canceled = TyphonPluginManager.getInstance().processEvent("run", runnerContext);


        const old = performance.now();

        try {
            await runner.runTyph(file as TyphonFile);
        } catch (err) {
            throw err;
        }

        const current = performance.now();

        if (options?.performance) {

            const performanceResult = {
                file: file,
                time: `${(current - old) / 1000}s`,
            }

            console.log("");
            this.getLogger().header("Performance Metrics Table:");
            this.getLogger().table(performanceResult);
            console.log("");

        }
    }
    
}