import { CommandBase } from "./CommandBase";
import { Command, program } from "commander";
import { InitCommand } from "./commands/init";
import { BuildCommand } from "./commands/build";
import { InstallCommand } from "./commands/install";
import { UpdateCommand } from "./commands/update";
import { RunCommand } from "./commands/run";
import { SettingStore } from "../settings/SettingStore";

export default function loadCommands(section: "typh" | "typhon"): Command {
    const commands: CommandBase[] = [
        new InitCommand(),
        new BuildCommand(),
        new InstallCommand(),
        new UpdateCommand(),
        new RunCommand(),
    ];

    SettingStore.getInstance().ensure();

    for (const command of commands) {
        if (command.getSection() === section) {
            command.register();
        }
    }

    return program;
}