import { JavaScriptConfiguration } from "../../config";
import { AskInformation, Awaitable } from "../../types";

export type ProductFile = {
  name: string;
  content: string;
};

export type PromptOptions = Record<string, any> & { type: "confirm" | "select" | "input" };

export interface IProductInitializor {
  getInitialDirectories(): string[];
  getInitialFiles(): ProductFile[];
  updateConfig(config: JavaScriptConfiguration): Record<string, any>;
  addPromptOptions(): PromptOptions[];
  postInit(ask: AskInformation): Awaitable<void>;
}
