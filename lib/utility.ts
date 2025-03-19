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