import jetpack, { exists, path, read, write } from "fs-jetpack";
import { _TYPHON_HOMEDIR_PATH_, SettingStore } from "../settings/SettingStore";

export class CachingManager {

    private readonly cacheMap: Map<any, any> = new Map();
    private readonly cacheDirPath: string = path(_TYPHON_HOMEDIR_PATH_, "cache");

    static createCache() {
        return new CachingManager();
    }

    constructor() {
        SettingStore.ensureTyphonExists();
        this.createDiskCachingDirectory();
    }

    addElementToCacheMap(key: any, value: any) {
        this.cacheMap.set(key, value);
        return this;
    }

    retrieveElementFromCacheMap(key: any) {
        return this.cacheMap.get(key);
    }

    createDiskCachingDirectory() {
        jetpack.dir(this.cacheDirPath);
        return this;
    }

    retrieveOrCreateCacheFile(fileName: string, data?: string): string {
        const cachedContent = read(path(this.cacheDirPath, fileName), "utf8");
        if (!exists(path(this.cacheDirPath, fileName)) || !cachedContent) {
            write(fileName, data ?? "");
            return data ?? "";
        }
        return cachedContent;
    }

    ensureCacheDirectory(name: string) {
        const p = path(this.cacheDirPath, name);
        jetpack.dir(p);
        return p;
    }

    findCacheDirectory(name: string) {
        return path(this.cacheDirPath, name);
    }

    getCacheDirectory() {
        return this.cacheDirPath;
    }
}