import { TyphonConfig } from "./types";

export * from "./project";
export * from "./packager";
export * from "./SignaleScoped";

/* Typings Only */
export * from "./types";

export function withTyphon(config: TyphonConfig): TyphonConfig { return config; }