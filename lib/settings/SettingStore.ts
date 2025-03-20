import jetpack, { exists, path, read, write } from "fs-jetpack";
import os from "os";
import { resolveMap } from "../utility";

const _SETTINGS_FILE_NAME_ = `typhon.json`;
export const _TYPHON_HOMEDIR_PATH_ = path(os.homedir(), ".typhon")

export class SettingStore {

    static ensureTyphonExists() {
        jetpack.dir(_TYPHON_HOMEDIR_PATH_);
        jetpack.dir(path(_TYPHON_HOMEDIR_PATH_, "config"));
    }

    private static instance: SettingStore;
    static getInstance() {
        if (!this.instance) {
            this.instance = new SettingStore();
        }
        return this.instance
    }

    private map: Map<string, any> = new Map();

    constructor() {
        SettingStore.ensureTyphonExists();
        this.ensure();
    }

    ensure() {
        if (!exists(this.getDirectory())) {
            this.write();
        }

        const data = JSON.parse(read(this.getDirectory(), "utf8")!);
        this.map = resolveMap(data);
        return this.map;
    }

    getStoreMap() {
        return this.map;
    }

    set<T>(key: string, value: T) {
        this.map.set(key, value);
        return this;
    }

    get<T>(key: string): T | undefined {
        return this.map.get(key);
    }

    has(key: string): boolean {
        return this.map.has(key);
    }

    forEach<T>(predicate: (value: T, key: string, store: this) => void): SettingStore {
        this.getStoreMap().forEach((v, k) => {
            predicate(v, k, this);
        });
        return this;
    }

    entries<T>(): MapIterator<[string, T]> {
        return this.getStoreMap().entries();
    }

    keys() {
        return this.getStoreMap().keys();
    }

    values() {
        return this.getStoreMap().values();
    }
    
    toString() {
        return JSON.stringify(this.toJSON(), null, 4);
    }

    toJSON() {
        const obj: Record<string, any> = {};
        for (const [k, v] of this.getStoreMap().entries()) {
            obj[k] = v;
        }
        return obj
    }

    getDirectory() {
        return path(_TYPHON_HOMEDIR_PATH_, "config", _SETTINGS_FILE_NAME_);
    }

    write() {
        write(this.getDirectory(), this.toString());
    }
}