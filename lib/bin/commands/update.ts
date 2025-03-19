import { Command } from "commander";
import { CommandBase } from "../CommandBase";
import { Project } from "../../project";
import { withTyphon } from "../..";
import { spawnSync } from "child_process";
import os from "os";

export interface UpdateOptions {
    install?: boolean;
    sudo?: boolean;
}

export class UpdateCommand extends CommandBase {
    constructor() {
        super("update", "Updates the Typhon configuration");
    }

    setupCommand(): Command {
        return this.getCommand()
            .option("-i, --install", "Reinstalls the global Typhon CLI, on some systems this may require the --sudo option")
            .option("--sudo", "Used to use sudo when reinstalling the gobal Typhon CLI on some systems, ex: Linux")
    }

    async execute(options?: UpdateOptions): Promise<void> {
        
        if (options?.install) {
            await this.reinstall(options.sudo);
        }

        const project = new Project(process.cwd());
        const defaultConfig = withTyphon({
            buildinfo: {
                name: "DEFAULT_CONFIG",
                version: "1.0.0",
                packageManager: "npm",
            },
            build: {
                main: "index.js"
            },
            dependencies: {}
        });

        project.getConfig().merge(defaultConfig, false);
        project.getConfig().save();
        this.getLogger().success("Updated the current project configuration successfully!");
        
    }

    async reinstall(sudo?: boolean): Promise<void> {

        const command = os.platform() === "win32" ? "npm.cmd" : "npm";
        const args = ["install", "-g", "typhonjs"];

        if (sudo) {
            args.unshift("sudo");
        }

        const result = spawnSync(command, args, { stdio: "inherit" });

        if (result.error) {
            this.getLogger().error(`Failed to reinstall the global Typhon CLI: ${result.error.message}`);
            return;
        }

        this.getLogger().success("Reinstalled the global Typhon CLI successfully");
    }

}