export interface PackagerOptions {

    distDirectory?: string;
    packagingName?: TyphonZipName;
    excludeTests?: boolean;
    ignore?: string[];

}

export type Awaitable<T> = T | Promise<T>;
export type TyphonFile = `${string}.js` | `${string}.ts`;
export type PackageManager = "pnpm" | "npm" | "yarn";

export interface TyphonConfig {

    buildinfo: {
        name: string;
        version: string;
        packageManager: PackageManager;
    },

    build: {
        main: TyphonFile;
    }

    dependencies: Record<string, string>;

}

export type TyphonZipName = `${string}.typh`;