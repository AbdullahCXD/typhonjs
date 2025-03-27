import { path } from "fs-jetpack";
import { JavaScriptConfiguration } from "../config/JavaScriptConfiguration";
import Collection from "../utils/Collection";
import { TyphonPlugin } from "./TyphonPlugin";
import { ArrayUtils } from "../utils/ArrayUtils";
import { TyphonEvents } from "../events/Events";
import { Newable } from "../types";

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
        // Add debug logging
        
        const configPath = path(projectDirectory, "plugins.typh.js");
    
        const config = new JavaScriptConfiguration(configPath, { plugins: [] });
    
        
        const plugins: any[] | undefined = config.get("plugins");

        if (plugins && ArrayUtils.isNotEmpty(plugins)) {
            for (const plugin of plugins) {
                let p: TyphonPlugin;
                console.log(plugin);
                if ('prototype' in plugin) {
                    const unconstructedPlugin: Newable<TyphonPlugin> = plugin as unknown as Newable<TyphonPlugin>
                    p = new unconstructedPlugin();
                } else {
                    p = plugin;
                }
                
                this.registerPlugin(p);
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
    processEvent<T extends keyof TyphonEvents>(key: T, ...args: TyphonEvents[T] extends any[] ? TyphonEvents[T] : never): boolean {
        for (const [_, plugin] of this.plugins) {
            return this.processPluginEvent(plugin, key, ...args);
        }

        return false;
    }

    processPluginEvent<T extends keyof TyphonEvents>(
        plugin: TyphonPlugin, 
        key: T, 
        ...args: TyphonEvents[T] extends any[] ? TyphonEvents[T] : never
      ): boolean {
        plugin.emit<T>(key, ...args as any);
        return true;
      }
}