import { IProductInitializor, ProductFile } from "./IProductInitializor";

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
}