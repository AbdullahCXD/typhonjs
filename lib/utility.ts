import { spawn } from "child_process";
import fs from "fs";
import { gracefulify } from "graceful-fs";
gracefulify(fs);

export function isDirectory(p: string, expectedName?: string): boolean {
    if (!fs.existsSync(p)) {
        return false;
    }
    const stat = fs.statSync(p);
    if (!stat.isDirectory()) {
        return false;
    }

    if (expectedName && (p !== expectedName || !p.endsWith(expectedName) || !p.includes(expectedName))) {
        return false;
    }

    return true;
}

export function resolveMap<K = any, V = any>(data: any): Map<K, V> {
    const map = new Map<K, V>();
    for (const [key, value] of Object.entries(data)) map.set(key as K, value as V);
    return map
}

export function execShellCommand(cmd: string, options = {}, ignoreStdio: boolean = true): Promise<void> {
    return new Promise((resolve, reject) => {
        const process = spawn(cmd, { shell: true, stdio: ignoreStdio ? "ignore" : "inherit", ...options });

        process.on("close", (code) => {
            if (code !== 0) reject(new Error(`Command failed: ${cmd}`));
            else resolve();
        });

        process.on("error", (err) => reject(new Error(`Execution error: ${err.message}`)));
    });
}