import path from "path";
import { JavaScriptConfiguration } from "../config/JavaScriptConfiguration";

export const _CONFIG_FILE_NAME_ = `typh.config.js`;

export class ProjectConfigLoader {

    static load(projectPath: string, autoload: boolean = true): JavaScriptConfiguration {
        if (!projectPath.startsWith(process.cwd())) projectPath = path.join(process.cwd(), projectPath);
        return new JavaScriptConfiguration(path.join(projectPath, _CONFIG_FILE_NAME_), {}, autoload)
    }

    static save(projectPath: string, config: any) {
        if (!projectPath.startsWith(process.cwd())) projectPath = path.join(process.cwd(), projectPath);
        const jsconfig = new JavaScriptConfiguration(path.join(projectPath, _CONFIG_FILE_NAME_), config, true);
        if (!jsconfig.exists()) jsconfig.setInitial();
        jsconfig.save();
    }
}