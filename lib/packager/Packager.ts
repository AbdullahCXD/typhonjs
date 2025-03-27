import fs from "fs";
import gracefulFs from "graceful-fs";
import path from "path";
import AdmZip from "adm-zip";
import jetpack from "fs-jetpack";
import chalk from "ansi-colors";
import prettyBytes from "bytes";
import { Project } from "../project";
import { PackageManager, PackagerOptions, TyphonBuildFile } from "../types";
import { figures, TyphonLogger } from "../TyphonLogger";
import { isDirectory } from "../utility";
import { PackagePath } from "./PackagePath";
import Messages from "../utils/Messages";
import { JavaScriptConfiguration } from "../config";

gracefulFs.gracefulify(fs);

interface PackageStats {
    totalFiles: number;
    totalSize: number;
    jsFiles: number;
    resourceFiles: number;
    skippedFiles: number;
}

export class Packager {
    private readonly distDir: string;
    private readonly packagingName: string;
    private readonly zip: AdmZip;
    private readonly excludeTests: boolean;
    private readonly ignorePatterns: Set<string>;
    private readonly logger: TyphonLogger;
    private readonly config: JavaScriptConfiguration;
    private readonly stats: PackageStats = {
        totalFiles: 0,
        totalSize: 0,
        jsFiles: 0,
        resourceFiles: 0,
        skippedFiles: 0
    };

    constructor(
        private readonly project: Project,
        options: PackagerOptions = {}
    ) {
        const {
            distDirectory = "target",
            packagingName,
            excludeTests = true,
            ignore = []
        } = options;

        this.distDir = distDirectory;
        this.config = new JavaScriptConfiguration(path.join(process.cwd(), "typh.config.js"), {}, true);
        this.packagingName = packagingName ?? `${this.config.get("buildinfo.name", "out")}.typh`;
        this.zip = new AdmZip();
        this.excludeTests = excludeTests;
        this.ignorePatterns = new Set(ignore);
        this.logger = TyphonLogger.getInstance("Typhon");
    }

    public async package(): Promise<void> {
        try {
            await this.validateProject();
            await this.initializePackage();
            await this.processSourceFiles();
            await this.finalizeBuild();
        } catch (error) {
            this.logger.failBuild(error as Error);
            throw error;
        }
    }

    private async validateProject(): Promise<void> {
        if (this.project.getConfig().getBoolean("buildinfo.plugin", false)) {
            throw new Error("Cannot package plugin project");
        }
    }

    private async initializePackage(): Promise<void> {
        this.logger.startBuild();
        this.displayPackageInfo();
        await this.prepareEnvironment();
    }

    private displayPackageInfo(): void {
        this.logger.startSection("Package Information", { icon: true });
        
        this.logger.keyValue({
            "📦 Project": chalk.bold(this.project.name || "Unknown"),
            "📋 Version": chalk.cyan(this.project.version || "0.0.1"),
            "📍 Target": chalk.dim(path.join(this.distDir, this.packagingName)),
            "🔧 Environment": chalk.yellow(process.env.NODE_ENV || "development"),
            "⚡ Package Manager": chalk.magenta(this.project.getConfig().getString("buildinfo.packageManager", "npm")),
            "📂 Source Directory": chalk.dim(this.project.projectPath)
        });
    }

    private async prepareEnvironment(): Promise<void> {
        this.logger.startSection("Preparing package environment");
        await jetpack.dirAsync(this.distDir);
        this.logger.endSection("Environment ready");
    }

    private async processSourceFiles(): Promise<void> {
        this.logger.startSection("Scanning source directories");
        
        const [jsFiles, resourceFiles] = await Promise.all([
            this.getFiles("src/main/javascript"),
            this.getFiles("src/main/resources")
        ]);

        this.displayFileStats(jsFiles, resourceFiles);
        await this.packageFiles(jsFiles, resourceFiles);
    }

    private displayFileStats(jsFiles: string[], resourceFiles: string[]): void {
        const totalFiles = jsFiles.length + resourceFiles.length;
        
        this.logger.info(`Found ${chalk.cyan(totalFiles.toString())} files to process`);
        
        this.logger.customTable(
            ["Type", "Count", "Status", "Details"],
            [
                ["JavaScript", jsFiles.length, chalk.green("✓"), chalk.dim("*.js, *.ts files")],
                ["Resources", resourceFiles.length, chalk.green("✓"), chalk.dim("static assets")],
                ["Total", totalFiles, "", chalk.dim("all files")]
            ],
            {
                align: ["left", "right", "center", "left"]
            }
        );
    }

    private async packageFiles(jsFiles: string[], resourceFiles: string[]): Promise<void> {
        this.logger.startSection("Packaging files");
        
        await Promise.all([
            this.processFileSet(jsFiles, "src/main/javascript", "js", "JavaScript files"),
            this.processFileSet(resourceFiles, "src/main/resources", "resources", "Resource files")
        ]);
    }

    private async processFileSet(
        files: string[], 
        sourceDir: string, 
        taskId: string, 
        label: string
    ): Promise<void> {
        if (files.length === 0) {
            this.logger.warn(`${figures.warning} No ${label} found to process`);
            return;
        }

        this.logger.startSection(`Processing ${label}`, { icon: true });
        
        const startTime = Date.now();
        await this.addFilesToZip(files, sourceDir, taskId);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        this.logger.keyValue({
            "📁 Files": chalk.cyan(`${files.length}`),
            "⚡ Speed": chalk.yellow(`${(files.length / parseFloat(duration)).toFixed(1)} files/s`),
            "⏱️ Duration": chalk.magenta(`${duration}s`)
        });

        this.logger.endSection(`✨ Processed ${label}`, true);
    }

    private async getFiles(relativePath: string): Promise<string[]> {
        const sourceDir = path.join(this.project.projectPath, relativePath);
        
        if (!fs.existsSync(sourceDir)) return [];

        const files = await jetpack.findAsync(sourceDir, { 
            matching: "**/*",
            files: true,
            directories: false
        });

        return files.filter(file => !this.isIgnored(file));
    }

    private async addFilesToZip(files: string[], sourceDir: string, taskId: string): Promise<number> {
        const batchSize = 50;
        const batches = Math.ceil(files.length / batchSize);
        
        for (let i = 0; i < batches; i++) {
            const start = i * batchSize;
            const end = Math.min(start + batchSize, files.length);
            const batch = files.slice(start, end);
            
            await Promise.all(batch.map(async (file) => {
                const relativePath = path.relative(sourceDir, file);
                const zipPath = relativePath.replace(/\\/g, "/");
                const fileStats = fs.statSync(file);

                this.stats.totalSize += fileStats.size;
                this.stats.totalFiles++;
                
                if (zipPath.endsWith('.js')) {
                    this.stats.jsFiles++;
                } else {
                    this.stats.resourceFiles++;
                }
                
                this.zip.addLocalFile(file, path.dirname(zipPath));
                
                this.logger.debug(`Added ${chalk.dim(zipPath)}`);
            }));
            
            if (batches > 1) {
                this.logger.info(`${figures.pointer} Processed batch ${i + 1}/${batches} (${end}/${files.length} files)`);
            }
        }

        return files.length;
    }

    private isIgnored(filePath: string): boolean {
        const normalizedPath = filePath.replace(/\\/g, "/");
        return this.ignorePatterns.has(normalizedPath) || 
               (this.excludeTests && normalizedPath.includes("/test/"));
    }

    private async finalizeBuild(): Promise<void> {
        await this.writeBuildInfo();
        await this.createArchive();
        this.displaySummary();
        this.logger.finishBuild();
    }

    private async writeBuildInfo(): Promise<void> {
        const buildInfo: TyphonBuildFile = {
            name: this.project.name,
            version: this.project.version,
            main: PackagePath.replace(this.project.getConfig().getString("build.main")!),
            pm: this.project.getConfig().get<PackageManager>("buildinfo.packageManager")!,
            deps: this.project.getConfig().get<Record<string, string>>("dependencies")!
        };

        this.zip.addFile(
            "typhon.build.json", 
            Buffer.from(JSON.stringify(buildInfo, null, 2))
        );
        
        this.logger.endSection("Packaging complete");
    }

    private async createArchive(): Promise<void> {
        this.logger.startSection("📦 Creating Archive");
        
        await this.zip.writeZipPromise(path.join(this.distDir, this.packagingName));
        
        this.logger.endSection("📦 Created Archive");
    }

    private displaySummary(): void {
        const stats = fs.statSync(path.join(this.distDir, this.packagingName));
        const compressionRatio = ((this.stats.totalSize - stats.size) / this.stats.totalSize * 100).toFixed(1);
        
        this.logger.startSection("📊 Build Summary", { icon: true });
        
        this.logger.keyValue({
            "📄 JavaScript Files": `${chalk.cyan(this.stats.jsFiles.toString())} files`,
            "🗂️ Resource Files": `${chalk.cyan(this.stats.resourceFiles.toString())} files`,
            "📦 Total Files": chalk.bold(`${this.stats.totalFiles} files`),
            "⏭️ Skipped": this.stats.skippedFiles > 0 ? chalk.yellow(`${this.stats.skippedFiles} files`) : chalk.dim('none'),
            "💾 Package Size": chalk.green(prettyBytes(stats.size)!),
            "📉 Compression": chalk.cyan(`${compressionRatio}%`),
            "⚡ Performance": chalk.magenta(`${process.uptime().toFixed(2)}s`),
            "🎯 Status": chalk.green("SUCCESS")
        });

        if (this.stats.skippedFiles > 0) {
            this.logger.warn(`${figures.warning} ${this.stats.skippedFiles} files were skipped during packaging`);
        }

        this.logger.success(`${figures.star} Build completed successfully! ${chalk.dim(new Date().toISOString())}`);
    }

    private getTimestamp(): string {
        return new Date().toISOString();
    }
}