import path from "path";

export class PackagePath {

    static replace(main: string) {
        const p = path.parse(main);
        // Only replace dots with path separators in the directory part
        const dirPath = p.dir.replaceAll(".", path.sep);
        // Combine the transformed directory path with the original filename including extension
        return path.join(dirPath, p.base);
    }

}