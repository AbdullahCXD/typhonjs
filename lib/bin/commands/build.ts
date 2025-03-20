import { Command } from "commander";
import { CommandBase, SectionType } from "../CommandBase";
import { Project } from "../../project";
import { Packager } from "../../packager";
import { CancellableEvent } from "../../events/Events";
import { TyphonPluginManager } from "../../plugin/TyphonPluginManager";

export interface BuildEventContext extends CancellableEvent {

    project: Project;
    packager: Packager;

}

export class BuildCommand extends CommandBase<SectionType> {

    constructor() {
        super("build", "Builds the Typhon project");
    }

    getSection(): SectionType {
        return "typh";
    }

    setupCommand(): Command {
        return this.getCommand();
    }

    async execute(): Promise<void> {

        const project = new Project(process.cwd());
        const packager = project.loadPackager();
        const eventData: BuildEventContext = {
            packager: packager,
            project: project,
            canceled: false
        };

        const canceled = TyphonPluginManager.getInstance().processEvent("build", eventData);
        if (canceled) return;

        await packager.package();

    }

}