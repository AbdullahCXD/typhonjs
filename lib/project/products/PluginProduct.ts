import { JavaScriptConfiguration } from "../../config";
import { AskInformation } from "../../types";
import { TyphonLogger } from "../../TyphonLogger";
import { execShellCommand } from "../../utility";
import { IProductInitializor, ProductFile, PromptOptions } from "./IProductInitializor";
import chalk from "ansi-colors";

const mainEntryContent = `/* Generated Typhon Plugin Product */

const { TyphonPlugin } = require("typhonjs");

class PluginProduct extends TyphonPlugin {

    load() {
        console.log("Loaded!");
    }

}

module.exports = PluginProduct;
`

export class PluginProduct implements IProductInitializor {

    getInitialDirectories(): string[] {
        return [
            "src"
        ]
    }

    getInitialFiles(): ProductFile[] {
        return [
            {
                name: "src/plugin.js",
                content: mainEntryContent
            }
        ]
    }
    
    async postInit(info: AskInformation): Promise<void> {
        const deps: string[] = [`typhonjs@${info.dependency == "dev" ? "dev" : "latest"}`];
        const logger = TyphonLogger.getInstance("Plugin");
        logger.info("Installing dependencies:");
        logger.info(deps.map((v) => `${chalk.blueBright("-")} ${chalk.greenBright(v)}`).join("\n"));

        await execShellCommand(`pnpm install ${deps.join(" ")}`, { cwd: process.cwd(), env: process.env }, true);


        logger.info("Finished creating plugin product, test your plugin by running:");
        logger.info(`> ${chalk.blueBright(`typhon plugin test`)}`);
    }

    addPromptOptions(): PromptOptions[] {
        return [
            {
                type: "select",
                name: "dependency",
                message: "Which dependency you would like to install?",
                choices: [
                    "dev",
                    "default"
                ]
            }
        ];
    }

    updateConfig(config: JavaScriptConfiguration) {
        config.set("buildinfo.plugin", true);
        return {}
    }
}