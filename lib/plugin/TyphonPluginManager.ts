import { path } from "fs-jetpack";
import { JavaScriptConfiguration } from "../config/JavaScriptConfiguration";
import Collection from "../utils/Collection";
import { TyphonPlugin } from "./TyphonPlugin";
import { ArrayUtils } from "../utils/ArrayUtils";
import { CancellableEvent, TyphonEvents } from "../events/Events";

export class TyphonPluginManager {

    private static instance: TyphonPluginManager;

    public static getInstance() {
        if (!this.instance) this.instance = new TyphonPluginManager();
        return this.instance;
    }

    private plugins: Collection<string, TyphonPlugin> = new Collection(); 
        
    constructor() {

    }

    registerPlugins(projectDirectory: string) {

        const config = new JavaScriptConfiguration(path(projectDirectory, "plugins.typh.json"), { plugins: [] });
        if (!config.exists()) return this;
        const plugins = config.get("plugins") as TyphonPlugin[];

        if (plugins && ArrayUtils.isNotEmpty(plugins)) {
            for (const plugin of plugins) {
                this.registerPlugin(plugin);
            }
        }

        return this;
    }

    async test(plugin: TyphonPlugin): Promise<[boolean, Error | undefined]> {
        try {
            await plugin.load();

            // test out push event
            this.processPluginEvent(plugin, "test");
            return [true, undefined];
        } catch (err) {
            return [false, err as Error];
        }
    }

    registerPlugin(plugin: TyphonPlugin) {
        plugin.load();
        this.plugins.set(plugin.getPluginInformation().name, plugin);
        return this;
    }

    /**
     * Processes event in every plugin
     * @param key Event name
     * @param args Arguments of the event
     * @returns Cancelled or not
     */
    processEvent<T extends keyof TyphonEvents>(key: T, ...args: TyphonEvents[T]): boolean {
        for (const [_, plugin] of this.plugins) {
            return this.processPluginEvent(plugin, key, ...args);
        }

        return false;
    }

    processPluginEvent<T extends keyof TyphonEvents>(plugin: TyphonPlugin, key: T, ...args: TyphonEvents[T]): boolean {
        const result = plugin.onEvent(key, ...args);
        const cancelledEvents = ArrayUtils.filter(result as CancellableEvent[], (v) => v.canceled == true);
        if (ArrayUtils.isNotEmpty(cancelledEvents)) {
            return true;
        }
        return false;
    }
}