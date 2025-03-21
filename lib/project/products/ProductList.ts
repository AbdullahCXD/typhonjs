import { Project } from "../Project";
import { EmptyProduct } from "./EmptyProduct";
import { ExampleProduct } from "./ExampleProduct";
import { IProductInitializor } from "./IProductInitializor";
import { PluginProduct } from "./PluginProduct";

export class ProductList {

    private static register: Map<string, IProductInitializor> = new Map();

    static {
        this.registerProduct("empty", new EmptyProduct());
        this.registerProduct("example", new ExampleProduct());
        this.registerProduct("plugin", new PluginProduct());
    }

    public static registerProduct(name: string, product: IProductInitializor) {
        this.register.set(name, product);
    }

    public static getProducts(): string[] {
        return Array.from(this.register.keys());
    }

    public static getProduct(name: string): IProductInitializor | undefined {
        return this.register.get(name);
    }

    public static hasProduct(name: string): boolean {
        return this.register.has(name);
    }

    public static updateProduct(project: Project, productName: string) {
        if (!this.hasProduct(productName)) {
            throw new Error(`Product ${productName} is not registered`);
        }

        const product = this.getProduct(productName)!;
        project.setProduct(product);
        return true;
    }
}