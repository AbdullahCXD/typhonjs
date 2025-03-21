import { TyphonConfig } from "./types";

export * from "./project";
export * from "./packager";
export * from "./SignaleScoped";
export * from "./utility";
export * from "./utils";
export * from "./settings";
export * from "./runner";
export * from "./plugin";
export * from "./events";
export * from "./commands";
export * from "./config";
export * from "./caching";
export * from "./TyphonLogger";

/* Typings Only */
export * from "./types";

export function withTyphon(config: TyphonConfig): TyphonConfig { return config; }