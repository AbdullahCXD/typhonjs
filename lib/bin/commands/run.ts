import { Command } from "commander";
import { TyphRunner } from "../../runner/TyphRunner";
import { TyphonFile } from "../../types";
import { CommandBase } from "../CommandBase";
import { inspect } from "fs-jetpack"

export class RunCommand extends CommandBase {

    constructor() {
        super("run <file>", "Loads and runs a typh file");
    }

    getSection(): "typh" | "typhon" {
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

        const old = performance.now();

        try {
            await runner.runTyph(file as TyphonFile);
        } catch (err) {
            throw err;
        }

        const current = performance.now();

        if (options?.performance) {

            console.log("");
            this.getLogger().startSection("Performance Metrics");
            this.getLogger().info("Time: " + ((current / old) * 1000) + "s");
            this.getLogger().endSection("Performance Metrics", true);
            console.log("");

        }
    }
    
}