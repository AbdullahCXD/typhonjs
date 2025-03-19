import { withTyphon } from "../..";
import { Project } from "../../project";
import { TyphonConfig } from "../../types";
import { CommandBase } from "../CommandBase";
import { Listr } from "listr2";
import enquirer from "enquirer";
import semver from "semver";
import { ProjectConfigLoader } from "../../project/ProjectConfigLoader";
import { ProductList } from "../../project/products/ProductList";

export interface InitContext {
    config?: TyphonConfig;
    project?: Project;
}

export class InitCommand extends CommandBase {
    constructor() {
        super("init [product]", "Initialize a new Typhon project");
    }

    async execute(product?: string): Promise<void> {
        
        const { name, version } = await this.askInfo();

        const listr = new Listr<InitContext>([
            {
                title: "Generate a Tyhon configuration",
                task: (ctx) => {
                    ctx.config = this.writeConfiguration(name, version);
                }
            },
            {
                title: "Create the project",
                task: (ctx) => {
                    const project = new Project(process.cwd());
                    if (product && ProductList.hasProduct(product)) {
                        ProductList.updateProduct(project, product);
                    }

                    project.initProduct();
                    project.initPackage();
                    ctx.project = project;
                }
            },
            {
                title: "Cleaning up...",
                task: (ctx) => {
                    ctx.config = undefined;
                    ctx.project = undefined;
                }
            }
        ], { ctx: {}, concurrent: false });

        await listr.run();
        
    }

    async askInfo(): Promise<{ name: string, version: string }> {
        const { name, version }: { name: string, version: string } = await enquirer.prompt([
            {
                type: "input",
                name: "name",
                required: true,
                message: "Enter the name of the project"
            },
            {
                type: "input",
                name: "version",
                initial: "0.0.1",
                validate(value) {
                    return semver.valid(value) ? true : "Invalid version format";
                },
                message: "Enter the version of the project"
            }
        ]);

        return { name, version };
    }

    
    writeConfiguration(name: string, version: string): TyphonConfig {
        const config: TyphonConfig = withTyphon({
            buildinfo: {
                name: name,
                version: version,
                packageManager: "npm",
            },

            build: {
                main: "index.js",
            },

            dependencies: {}
        });

        ProjectConfigLoader.save(process.cwd(), config);

        return config;
    }
}