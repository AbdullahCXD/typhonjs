export type ProductFile = {
    name: string;
    content: string;
}

export interface IProductInitializor {

    getInitialDirectories(): string[];
    getInitialFiles(): ProductFile[];

}