import fs from "fs";
import gracefulFs from "graceful-fs";
import path from "path";
import AdmZip from "adm-zip";
import jetpack from "fs-jetpack";
import chalk from "ansi-colors";
import prettyBytes from "bytes";
import { Project } from "../project";
import { PackagerOptions } from "../types";
import { TyphonLogger } from "../TyphonLogger";
import { isDirectory } from "../utility";

gracefulFs.gracefulify(fs);

export class Packager {
    private distDir: string;
    private packagingName: string;
    private zip: AdmZip;
    private excludeTests: boolean;
    private ignorePatterns: Set<string>;
    private logger: TyphonLogger;
    private stats = {
        totalFiles: 0,
        totalSize: 0,
        jsFiles: 0,
        resourceFiles: 0,
        skippedFiles: 0
    };
    
    constructor(private project: Project, options?: PackagerOptions) {
        this.distDir = options?.distDirectory ?? "target";
        this.packagingName = options?.packagingName ?? `${this.project.name}.typh`;
        this.zip = new AdmZip();
        this.excludeTests = options?.excludeTests ?? true;
        this.ignorePatterns = new Set(options?.ignore ?? []);
        this.logger = TyphonLogger.getInstance("Typhon");
    }

    async package(): Promise<void> {
        try {
            // Start the build process
            this.logger.startBuild();
            
            // Ensure target directory exists
            await jetpack.dirAsync(this.distDir);
            const targetFile = path.join(this.distDir, this.packagingName);
            const projectRoot = this.project.projectPath;
            
            // Show project information
            this.logger.info(`${chalk.bold(this.project.name)} v${chalk.cyan(this.project.version || "0.0.1")}`);
            
            // Start packaging section
            this.logger.startSection("Preparing package environment");
            this.logger.info(`Target: ${chalk.cyan(targetFile)}`);
            this.logger.info(`Root: ${chalk.dim(projectRoot)}`);
            this.logger.endSection("Preparation complete");
            
            // Get files from source directories
            this.logger.startSection("Scanning source directories");
            
            // JavaScript files
            const jsDir = path.join(projectRoot, "src/main/javascript");
            const jsFiles = await this.getFiles(jsDir);
            this.stats.jsFiles = jsFiles.filter(file => !isDirectory(file)).length;
            this.logger.info(`Found ${chalk.yellow(this.stats.jsFiles.toString())} JavaScript files`);
            
            // Resource files
            const resourcesDir = path.join(projectRoot, "src/main/resources");
            const resourceFiles = await this.getFiles(resourcesDir);
            this.stats.resourceFiles = resourceFiles.filter(file => !isDirectory(file)).length;
            this.logger.info(`Found ${chalk.yellow(this.stats.resourceFiles.toString())} resource files`);
            
            this.logger.endSection("Scanning complete");
            
            // Start packaging files
            this.logger.startSection("Packaging files");
            
            // Package JavaScript files
            if (this.stats.jsFiles > 0) {
                this.logger.startTask("js", `Processing JavaScript files`, this.stats.jsFiles);
                await this.addFilesToZip(jsFiles, jsDir, "js");
                this.logger.completeTask("js");
                this.logger.success(`JavaScript files packaged`);
            }
            
            // Package resource files
            if (this.stats.resourceFiles > 0) {
                this.logger.startTask("resources", `Processing resource files`, this.stats.resourceFiles);
                await this.addFilesToZip(resourceFiles, resourcesDir, "resources");
                this.logger.completeTask("resources");
                this.logger.success(`Resource files packaged`);
            }

            const buildBuffer = Buffer.from(JSON.stringify({
                name: this.project.name,
                version: this.project.version,
                main: this.project.getConfig().get("build.main")!
            }));

            this.zip.addFile("typhbuild.config.json", buildBuffer);
            
            this.logger.endSection("Packaging complete");
            
            // Write the zip file
            this.logger.startSection("Creating archive");
            this.logger.info(`Writing ${chalk.cyan(this.packagingName)}`);
            await this.zip.writeZipPromise(targetFile);
            
            // Get the size of the final file
            const fileStats = fs.statSync(targetFile);
            this.logger.info(`Archive size: ${chalk.yellow(prettyBytes(fileStats.size)!)}`);
            this.logger.endSection("Archive created");
            
            // Display summary
            this.logger.info(`${chalk.bold("Summary:")}`);
            this.logger.info(`  JavaScript files: ${chalk.yellow(this.stats.jsFiles.toString())}`);
            this.logger.info(`  Resource files: ${chalk.yellow(this.stats.resourceFiles.toString())}`);
            this.logger.info(`  Total files: ${chalk.yellow(this.stats.totalFiles.toString())}`);
            if (this.stats.skippedFiles > 0) {
                this.logger.info(`  Skipped files: ${chalk.yellow(this.stats.skippedFiles.toString())}`);
            }
            this.logger.info(`  Package size: ${chalk.yellow(prettyBytes(fileStats.size)!)}`);
            
            // Finish the build
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