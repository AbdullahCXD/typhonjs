import { CommandBase, SectionType } from "./CommandBase";
import { Command, program } from "commander";
import { InitCommand } from "./commands/init";
import { BuildCommand } from "./commands/build";
import { InstallCommand } from "./commands/install";
import { UpdateCommand } from "./commands/update";
import { RunCommand } from "./commands/run";
import { SettingStore } from "../settings/SettingStore";
import { CommandRegistry } from "../commands/CommandRegistry";
import { TyphonPluginManager } from "../plugin";
import { PluginCommand } from "./commands/plugin";

export default function loadCommands(section: SectionType): Command {
    const registry = CommandRegistry.getInstance();
    registry.addDefaults(
        new InitCommand(),
        new BuildCommand(),
        new InstallCommand(),
        new UpdateCommand(),
        new RunCommand(),
        new PluginCommand(),
    )

    SettingStore.getInstance().ensure();
    TyphonPluginManager.getInstance().registerPlugins(process.cwd());

    if (section === "typh") {
        const typhCommands = registry.getTyphCommands();
        typhCommands.forEach((v) => v.register());
    }
    else if (section == "typhon") {
        const typhonCommands = registry.getTyphonCommands();
        typhonCommands.forEach((v) => v.register());
    }

    registry.getCommands().filter((v) => v.getSection() === "both").forEach((v) => v.register());

    return program;
}