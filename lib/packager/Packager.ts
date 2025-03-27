import fs from "fs";
import gracefulFs from "graceful-fs";
import path from "path";
import AdmZip from "adm-zip";
import jetpack from "fs-jetpack";
import chalk from "ansi-colors";
import prettyBytes from "bytes";
import { Project } from "../project";
import { PackageManager, PackagerOptions, TyphonBuildFile } from "../types";
import { TyphonLogger } from "../TyphonLogger";
import { isDirectory } from "../utility";
import { PackagePath } from "./PackagePath";
import Messages from "../utils/Messages";
import { JavaScriptConfiguration } from "../config";

gracefulFs.gracefulify(fs);

export class Packager {
    private distDir: string;
    private packagingName: string;
    private zip: AdmZip;
    private excludeTests: boolean;
    private ignorePatterns: Set<string>;
    private logger: TyphonLogger;
    private config: JavaScriptConfiguration;
    private stats = {
        totalFiles: 0,
        totalSize: 0,
        jsFiles: 0,
        resourceFiles: 0,
        skippedFiles: 0
    };
    
    constructor(private project: Project, options?: PackagerOptions) {
        this.distDir = options?.distDirectory ?? "target";
        this.config = new JavaScriptConfiguration(path.join(process.cwd(), "typh.config.js"), {}, true);
        this.packagingName = options?.packagingName ?? `${this.config.get("buildinfo.name", "out")}.typh`;
        this.zip = new AdmZip();
        this.excludeTests = options?.excludeTests ?? true;
        this.ignorePatterns = new Set(options?.ignore ?? []);
        this.logger = TyphonLogger.getInstance("Typhon");
    }

    async package(): Promise<void> {
        try {
            if (this.project.getConfig().getBoolean("buildinfo.plugin", false)) {
                this.logger.warn("Cannot package plugin project");
                return;
            }

            // Start build with project info
            this.logger.startBuild();
            this.logger.keyValue({
                "Project": chalk.bold(this.packagingName || "Unknown"),
                "Version": chalk.cyan(this.project.version || "0.0.1"),
                "Target": chalk.dim(path.join(this.distDir, this.packagingName))
            }, "Package Information");

            // Prepare package environment
            this.logger.startSection("Preparing package environment");
            await jetpack.dirAsync(this.distDir);
            this.logger.endSection("Environment ready");

            // Scan source directories
            this.logger.startSection("Scanning source directories");
            
            const [jsFiles, resourceFiles] = await Promise.all([
                this.getFiles(path.join(this.project.projectPath, "src/main/javascript")),
                this.getFiles(path.join(this.project.projectPath, "src/main/resources"))
            ]);

            this.logger.customTable(
                ["Source Type", "Files", "Status"],
                [
                    ["JavaScript", jsFiles.length, chalk.green("✓")],
                    ["Resources", resourceFiles.length, chalk.green("✓")]
                ],
                {
                    headerColor: "cyan",
                    align: ["left", "right", "center"]
                }
            );
            
            this.logger.endSection("Scan complete");

            // Package files
            this.logger.startSection("Packaging files");
            
            if (jsFiles.length > 0) {
                this.logger.startTask("js", "Processing JavaScript files", jsFiles.length);
                await this.addFilesToZip(jsFiles, "src/main/javascript", "js");
                this.logger.completeTask("js");
            }

            if (resourceFiles.length > 0) {
                this.logger.startTask("resources", "Processing resource files", resourceFiles.length);
                await this.addFilesToZip(resourceFiles, "src/main/resources", "resources");
                this.logger.completeTask("resources");
            }

            // Add build info
            const buildInfo = {
                name: this.project.name,
                version: this.project.version,
                main: PackagePath.replace(this.project.getConfig().getString("build.main")!),
                pm: this.project.getConfig().get("buildinfo.packageManager"),
                deps: this.project.getConfig().get("dependencies")
            };

            this.zip.addFile("typhon.build.json", Buffer.from(JSON.stringify(buildInfo, null, 2)));
            this.logger.endSection("Packaging complete");

            // Create final archive
            this.logger.startSection("Creating archive");
            await this.zip.writeZipPromise(path.join(this.distDir, this.packagingName));
            
            const stats = fs.statSync(path.join(this.distDir, this.packagingName));
            this.logger.endSection("Archive created");

            // Show summary
            this.logger.keyValue({
                "JavaScript files": this.stats.jsFiles,
                "Resource files": this.stats.resourceFiles,
                "Total files": this.stats.totalFiles,
                "Skipped files": this.stats.skippedFiles,
                "Package size": prettyBytes(stats.size)
            }, "Build Summary");

            this.logger.finishBuild();

        } catch (error) {
            this.logger.failBuild(error as Error);
            throw error;
        }
    }

    /**
     * Retrieves all valid files from a directory while applying filtering.
     */
    private async getFiles(sourceDir: string): Promise<string[]> {
        if (!fs.existsSync(sourceDir)) {
            return [];
        }

        let files = await jetpack.findAsync(sourceDir, { matching: "**/*" });
        const beforeCount = files.length;

        files = files.filter(file => !this.isIgnored(file));

        const ignoredCount = beforeCount - files.length;
        this.stats.skippedFiles += ignoredCount;
        
        if (ignoredCount > 0) {
            this.logger.info(`Excluded ${chalk.yellow(ignoredCount.toString())} files from ${path.basename(sourceDir)}`);
        }

        return files;
    }

    /**
     * Adds files from a directory to the ZIP, placing them directly in the root
     * without the src/main/javascript or src/main/resources prefix.
     */
    private async addFilesToZip(files: string[], sourceDir: string, taskId: string): Promise<number> {
        let processed = 0;
        const filesToProcess = files.filter(file => !isDirectory(file));
        
        for (const file of filesToProcess) {
            // Get the relative path from the source directory
            const relativePath = path.relative(sourceDir, file);
            
            // The zip path should be just the relative path
            const zipPath = relativePath.replace(/\\/g, "/");
            
            // Get file size for statistics
            const fileStats = fs.statSync(file);
            this.stats.totalSize += fileStats.size;
            
            // Add to zip without the src/main/javascript or src/main/resources prefix
            this.zip.addLocalFile(file, path.dirname(zipPath));
            
            processed++;
            this.stats.totalFiles++;
            
            // Update progress bar
            this.logger.updateTask(taskId, processed);
        }

        return filesToProcess.length;
    }

    /**
     * Determines if a file should be ignored based on `ignorePatterns` or `excludeTests`.
     */
    private isIgnored(filePath: string): boolean {
        const normalizedPath = filePath.replace(/\\/g, "/");

        for (const pattern of this.ignorePatterns) {
            if (normalizedPath.includes(pattern)) {
                return true;
            }
        }

        if (this.excludeTests && normalizedPath.includes("/test/")) {
            return true;
        }

        return false;
    }
}