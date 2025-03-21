import { JavaScriptConfiguration } from "../../config";
import { AskInformation } from "../../types";
import { IProductInitializor, ProductFile, PromptOptions } from "./IProductInitializor";

export class EmptyProduct implements IProductInitializor {
    getInitialDirectories(): string[] {
        return [
            "src",
            "src/main",
            "src/test",
            "src/main/javascript",
            "src/main/resources",
            "src/test/javascript",
            "src/test/resources",
        ];
    }

    getInitialFiles(): ProductFile[] {
        return [];
    }

    updateConfig(config: JavaScriptConfiguration): Record<string, any> {
        return {}
    }

    addPromptOptions(): PromptOptions[] {
        return [];
    }

    postInit(askInfo: AskInformation): void {
        
    }
}