import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import AdmZip from "adm-zip";
import { PackageManager, TyphonBuildFile, TyphonFile } from "../types";
import { CachingManager } from "../caching/CachingManager";
import { VendorStore } from "../settings/VendorStore";
import { execShellCommand } from "../utility";

export interface BuildInfo {
    name: string;
    version: string;
    main: string;
    pm: PackageManager;
    deps: Record<string, `^${string}`>;
}

export class TyphRunner {
    private cache: CachingManager = CachingManager.createCache();
    private vendor: VendorStore = VendorStore.getInstance();

    constructor() {}

    async runTyph(file: TyphonFile) {
        if (!file.endsWith(".typh")) throw new Error("Unknown file extension: .typh required.");

        const zip = new AdmZip(file);
        const mainEntry = zip.getEntry(TyphonBuildFile);
        if (!mainEntry) throw new Error("No build entry found in typh file.");

        const buildInfo: BuildInfo = JSON.parse(this.bufferToString(mainEntry.getData()));
        const key = `${buildInfo.name}-cached`;
        const dirPath = this.cache.ensureCacheDirectory(key);

        // Extract files & install dependencies concurrently
        await Promise.all([
            this.extract(zip, dirPath),
            this.installDependencies(buildInfo, buildInfo.deps),
        ]);

        await this.runMain(buildInfo, dirPath);
    }

    extract(zip: AdmZip, targetPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            zip.extractAllToAsync(targetPath, true, true, (err) => {
                if (err) return reject(new Error("Extraction failed: " + err.message));
                resolve();
            });
        });
    }

    async installDependencies(buildInfo: BuildInfo, dependencies: Record<string, `^${string}`>) {
        const vendorPath = this.vendor.getVendorDirectory();

        // Create package.json
        VendorStore.ensureVendorExists();
        this.vendor.ensure();

        // Install dependencies using the correct package manager
        const installCmd = this.getInstallCommand(buildInfo.pm, vendorPath, this.dependenciesToArray(dependencies));
        if (!installCmd) throw new Error(`Unsupported package manager: ${buildInfo.pm}`);

        await execShellCommand(installCmd);
    }

    async runMain(buildInfo: BuildInfo, dirPath: string) {
        const vendorPath = this.vendor.getVendorDirectory();
        const mainFilePath = path.join(dirPath, buildInfo.main);

        return execShellCommand(`node ${mainFilePath}`, {
            env: { ...process.env, NODE_PATH: path.join(vendorPath, "node_modules") },
        }, false);
    }

    getInstallCommand(pm: PackageManager, dirPath: string, deps: [`${string}@${string}`]): string | null {
        switch (pm) {
            case "pnpm":
                return `pnpm install --prefix ${dirPath} ${deps.join(" ")}`;
            case "yarn":
                return `yarn install --modules-folder ${dirPath}/node_modules ${deps.join(" ")}`;
            case "npm":
                return `npm install --prefix ${dirPath} ${deps.join(" ")}`;
            default:
                return null;
        }
    }

    

    dependenciesToArray(dependencies: Record<string, `^${string}`>): [`${string}@${string}`] {
        return Object.entries(dependencies).map(([name, version]) => {
            return `${name}@${version.replaceAll(`^`, "")}`;
        }) as [`${string}@${string}`];
    }

    bufferToString(buffer: Buffer) {
        return buffer.toString("utf-8");
    }
}
