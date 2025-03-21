import { JavaScriptConfiguration } from "../../config";
import { AskInformation } from "../../types";
import { IProductInitializor, ProductFile, PromptOptions } from "./IProductInitializor";

export class ExampleProduct implements IProductInitializor {

    getInitialDirectories(): string[] {
        return [
            "src",
            "src/main",
            "src/test",
            "src/main/javascript",
            "src/main/resources",
            "src/test/javascript",
            "src/test/resources",

            /* Example product directory/package */
            `src/main/javascript/com/example`
        ];
    }

    getInitialFiles(): ProductFile[] {
        return [
            {
                name: "src/main/javascript/com/example/ExampleClass.js",
                content: `class ExampleClass {
    constructor() {
        console.log("Example class created");
    }
}

module.exports = ExampleClass;`
            }
        ];
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