import { Command } from "commander";
import { Awaitable, Newable } from "../../types";
import { CommandBase, SectionType } from "../CommandBase";
import { Project } from "../../project";
import { path } from "fs-jetpack";
import { PackagePath } from "../../packager/PackagePath";
import { TyphonPlugin, TyphonPluginManager } from "../../plugin";

export class PluginCommand extends CommandBase<SectionType> {

    constructor() {
        super("plugin", "Plugin Management command", {
            subcommands: true
        });
    }

    getSection(): SectionType {
        return "typhon"
    }

    setupCommand(): Command {
        return this.getCommand()
            .command("test")
            .description("Tests a plugin")
            .action(async (...args) => await this.testPlugin(...args));
    }

    async execute(...args: any[]): Promise<void> {
        


    }

    async testPlugin(...args: any[]): Promise<void> {

        const project = new Project(process.cwd());
        const config = project.getConfig();
        if (!config.exists()) return this.getLogger().error("Cannot find project, please initialize a plugin project: `typhon init plugin`");
        const name = config.getString("buildinfo.name");
        const main = config.getString("build.main");
        const plugin = config.getBoolean("buildinfo.plugin", false);

        if (!plugin) return this.getLogger().error("Cannot test out a non plugin project.");
        if (!main) return this.getLogger().error("Cannot find main file, please add one at `build.main`");
        const fixedMain = PackagePath.replace(main);
        const mainJavaScript: Newable<TyphonPlugin> = require(path(process.cwd(), fixedMain));
        const clazz = new mainJavaScript();

        const [result, err] = await TyphonPluginManager.getInstance().test(clazz);
        if (!result) {
            throw err;
        }

        this.getLogger().success("Plugin " + name + " is perfectly working!");
    }

}