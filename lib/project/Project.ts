import fs from "fs";
import graceful from "graceful-fs";
import jetpack from "fs-jetpack";
import { IProductInitializor } from "./products/IProductInitializor";
import { EmptyProduct } from "./products/EmptyProduct";
import path from "path";
import { JavaScriptConfiguration } from "../config/JavaScriptConfiguration";
import { ProjectConfigLoader } from "./ProjectConfigLoader";
import { Packager } from "../packager";
import { AskInformation, PackagerOptions } from "../types";
import { LogLevel, TyphonLogger } from "../TyphonLogger";
import { spawnSync } from "child_process";
graceful.gracefulify(fs);

export class Project {

    public name!: string;
    public productInitializor: IProductInitializor;
    public version!: string;
    private projectConfig: JavaScriptConfiguration;
    private packager?: Packager;
    private logger: TyphonLogger;

    constructor(public projectPath: string) {
        this.projectConfig = ProjectConfigLoader.load(projectPath, false);
        this.setCustomDefinedConfig(this.projectConfig);
        this.productInitializor = new EmptyProduct();
        this.logger = new TyphonLogger(this.name, LogLevel.INFO);
    }

    setProduct(product: IProductInitializor) {
        this.productInitializor = product;
    } 

    renderFiles() {
        return jetpack.find(this.projectPath);
    }

    setCustomDefinedConfig(config: JavaScriptConfiguration) {
        this.projectConfig = config;
        this.name = config.get<string>("buildinfo.name")!;
        this.version = config.get<string>("buildinfo.version")!;
    }

    async initProduct(info: AskInformation) {

        this.projectConfig.setInitial();
        this.projectConfig.reload();
        const directories = this.productInitializor.getInitialDirectories();
        const files = this.productInitializor.getInitialFiles();

        for (const directory of directories) {
            this.logger.info("Creating -> " + directory);
            jetpack.dir(this.projectPath + "/" + directory);
        }

        for (const file of files) {
            this.logger.info("Creating -> " + file.name);
            jetpack.write(this.projectPath + "/" + file.name, file.content);
        }
     
        this.productInitializor.updateConfig(this.projectConfig);
        this.projectConfig.save();
        await this.productInitializor.postInit(info);
    }

    initPackage() {

        spawnSync("npm", ["init", "-y"], {
            cwd: this.projectPath,
            stdio: "ignore"
        });

    }

    getConfig() {
        return this.projectConfig;
    }

    loadPackager(options?: PackagerOptions): Packager {
        if (!this.packager) this.packager = new Packager(this, options);
        return this.packager
    }
}