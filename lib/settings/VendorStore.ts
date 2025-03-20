import jetpack, { exists, path, read, write } from "fs-jetpack";
import { _TYPHON_HOMEDIR_PATH_, SettingStore } from "./SettingStore";

export interface VendorPackageMap 
{
    name: `@typhon/personal-vendor`,
    version: `dep`,
    dependencies: Record<string, `^${string}`>
}

export class VendorStore {

    static ensureVendorExists() {
        jetpack.dir(_TYPHON_HOMEDIR_PATH_);
        jetpack.dir(path(_TYPHON_HOMEDIR_PATH_, "vendor"));
    }

    private static instance: VendorStore;
    static getInstance() {
        if (!this.instance) {
            this.instance = new VendorStore();
        }
        return this.instance
    }

    private vendorMap: VendorPackageMap;
    private vendorDirectory: string = path(_TYPHON_HOMEDIR_PATH_, `vendor`);

    constructor() {
        SettingStore.ensureTyphonExists();
        VendorStore.ensureVendorExists();
        this.vendorMap = {
            name: `@typhon/personal-vendor`,
            version: `dep`,
            dependencies: {}
        }

        this.ensure();
    }

    ensure() {
        if (!exists(path(this.vendorDirectory, "package.json"))) {
            this.write();
        }

        this.vendorMap = JSON.parse(read(path(this.vendorDirectory, "package.json"), "utf8")!);
        return this.vendorMap;
    }

    addDependency(dependency: string, version: `^${string}`) {
        this.vendorMap.dependencies[dependency] = version;
        return this;
    }

    addDependencies(...dependencies: { name: string, version: `^${string}` }[]) {
        for (const dependency of dependencies) {
            this.addDependency(dependency.name, dependency.version);
        }
        return this;
    }
    
    toString() {
        return JSON.stringify(this.toJSON(), null, 4);
    }

    toJSON() {
        return this.vendorMap;
    }

    getVendorDirectory() {
        return this.vendorDirectory;
    }

    write() {
        write(path(_TYPHON_HOMEDIR_PATH_, "vendor", `package.json`), this.toString());
    }
}