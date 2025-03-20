import { Listr } from "listr2";
import { Project } from "../../project";
import { PackageManager } from "../../types";
import { CommandBase } from "../CommandBase";
import * as chalk from "ansi-colors";
import fs from "fs";
import { gracefulify } from "graceful-fs";
import { execShellCommand } from "../../utility";
gracefulify(fs);

function getPackageVersion(pkgName: string) {
    const packageJson = require(`${process.cwd()}/package.json`);
    return packageJson.dependencies[pkgName] || packageJson.devDependencies[pkgName];
}

export interface InstallContext {
    packageManager?: PackageManager;
    executionCommand?: string;
}

export class InstallCommand extends CommandBase {
    constructor() {
        super("install <packages...>", "Install dependencies using a preferred package manager.");
    }

    async execute(packages: string[]): Promise<void> {
        const project = new Project(process.cwd());
        const pm = project.getConfig().get("buildinfo.packageManager") ?? "npm";

        const listr = new Listr<InstallContext>([
            {
                title: "🔍 Identifying Package Manager...",
                task: async (ctx, task) => {
                    ctx.packageManager = pm.toLowerCase() as PackageManager;
                    task.title = `✅ Using package manager: ${chalk.cyan(pm)}`;
                }
            },
            {
                title: "⚙️ Configuring Environment...",
                task: (ctx, task) => {
                    const commands: Record<string, string> = {
                        pnpm: "pnpm install",
                        yarn: "yarn add",
                        npm: "npm install"
                    };
                    ctx.executionCommand = commands[ctx.packageManager!] || "npm install";
                    task.title = `🔧 Environment configured for ${chalk.cyan(ctx.packageManager!)}`;
                }
            },
            {
                title: `📦 Installing ${chalk.cyan(packages.length.toString())} package(s)...`,
                task: async (ctx, task) => {
                    try {
                        await execShellCommand(`${ctx.executionCommand!} ${packages.join(" ")}`, { cwd: process.cwd(), env: process.env })

                        task.title = `✅ Successfully installed ${chalk.green(packages.length.toString())} package(s)`;
                    } catch (error) {
                        throw new Error(`🚨 Installation error: ${chalk.red((error as Error).message)}`);
                    }
                }
            },
            {
                title: `⚙️ Configuring Typhon...`,
                task: async (ctx, task) => {
                    let lastDependencyRecord = project.getConfig().get("dependencies") || {};
                    for (const pkg of packages) {
                        const version = getPackageVersion(pkg);
                        lastDependencyRecord[pkg] = `${version}`;
                    }
                    project.getConfig().set("dependencies", lastDependencyRecord);
                    project.getConfig().save();
                }
            },
            {
                title: `🧹 Cleaning up...`,
                task: async (ctx, task) => {
                    ctx.packageManager = undefined;
                    ctx.executionCommand = "";
                }
            }
        ], { ctx: {}, concurrent: false });

        await listr.run();
    }
}