import { CommandBase, SectionType } from "./CommandBase";
import { Command, program } from "commander";
import { InitCommand } from "./commands/init";
import { BuildCommand } from "./commands/build";
import { InstallCommand } from "./commands/install";
import { UpdateCommand } from "./commands/update";
import { RunCommand } from "./commands/run";
import { SettingStore } from "../settings/SettingStore";
import { CommandRegistry } from "../commands/CommandRegistry";

export default function loadCommands(section: SectionType): Command {
    const registry = CommandRegistry.getInstance();
    registry.addDefaults(
        new InitCommand(),
        new BuildCommand(),
        new InstallCommand(),
        new UpdateCommand(),
        new RunCommand()
    )

    SettingStore.getInstance().ensure();

    const typhCommands = registry.getTyphCommands();
    typhCommands.forEach((v) => v.register());
    const typhonCommands = registry.getTyphonCommands();
    typhonCommands.forEach((v) => v.register());

    return program;
}