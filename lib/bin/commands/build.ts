import { Command } from "commander";
import { CommandBase } from "../CommandBase";
import { Project } from "../../project";

export class BuildCommand extends CommandBase {

    constructor() {
        super("build", "Builds the Typhon project");
    }

    getSection(): "typh" | "typhon" {
        return "typh";
    }

    setupCommand(): Command {
        return this.getCommand();
    }

    async execute(): Promise<void> {

        const project = new Project(process.cwd());
        const packager = project.loadPackager();

        await packager.package();

    }

}