export interface PackagerOptions {

    distDirectory?: string;
    packagingName?: TyphonZipName;
    excludeTests?: boolean;
    ignore?: string[];

}

export type Awaitable<T> = T | Promise<T>;
export type TyphonFile = `${string}.js` | `${string}.ts`;
export type PackageManager = "pnpm" | "npm" | "yarn";

export const TyphonBuildFile = `typhbuild.config.json`;
export type Newable<T> = new (...args: any[]) => T;

export interface TyphonConfig {

    buildinfo: {
        name: string;
        version: string;
        packageManager: PackageManager;
        plugin?: boolean;
    },

    build: {
        main: TyphonFile;
    }

    dependencies: Record<string, string>;

}

export type AskInformation = {
    name: string;
    version: string;
} & Record<string, any>

export type TyphonZipName = `${string}.typh`;
