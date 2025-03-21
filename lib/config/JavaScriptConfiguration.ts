const fs = require('fs');
const path = require('path');

/**
 * ConfigManager class that handles reading and writing configurations
 * from/to a JavaScript configuration file
 */
export class JavaScriptConfiguration {

  private configPath: string;
  private config: Record<string, any>;

  /**
   * Creates a new ConfigManager instance
   * @param {string} configPath - Path to the configuration file (default: '.config.js')
   */
  constructor(configPath = '.config.js', private defaults: Record<string, any> = {}) {
    this.configPath = path.resolve(process.cwd(), configPath);
    this.config = this.loadConfig();
  }

  /**
   * Loads the configuration from the JavaScript file
   * @returns {Object} Configuration object
   */
  loadConfig() {
    try {
      // Clear the module cache to ensure we get fresh config
      delete require.cache[require.resolve(this.configPath)];
      
      // Import the config file
      const config = require(this.configPath);
      return typeof config === 'function' ? config() : config;
    } catch (error) {
      // If file doesn't exist or has errors, return empty config
      if ((error as any).code === 'MODULE_NOT_FOUND') {
        return this.defaults;
      }
      throw new Error(`Error loading config from ${this.configPath}: ${(error as Error).message}`);
    }
  }

  /**
   * Checks if a key exists or not
   * @param {string} key - The configuration key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {boolean} Results in the key exists or not.
   */
  has(key: string, defaultValue = undefined) {
    const keys = key.split('.');
    let value: Record<string, any> = this.config;
    
    for (const k of keys) {
      if (value === undefined || value === null || typeof value !== 'object') {
        return defaultValue;
      }
      value = value[k] as any;
    }
    
    return value !== undefined || value !== null;
  }

  /**
   * Gets a configuration value by key with generic type
   * @param {string} key - The configuration key
   * @param {T} defaultValue - Default value if key doesn't exist
   * @returns {T} The configuration value or default value
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    const keys = key.split('.');
    let value: any = this.config;
    
    for (const k of keys) {
      if (value === undefined || value === null || typeof value !== 'object') {
        return defaultValue;
      }
      value = value[k];
    }
    
    return value !== undefined ? value as T : defaultValue;
  }

  /**
   * Gets a boolean configuration value
   * @param {string} key - The configuration key
   * @param {boolean} defaultValue - Default value if key doesn't exist or is not a boolean
   * @returns {boolean} The boolean value or default
   */
  getBoolean(key: string, defaultValue = false): boolean {
    const value = this.get<any>(key);
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const lowercased = value.toLowerCase();
      if (lowercased === 'true' || lowercased === '1' || lowercased === 'yes') {
        return true;
      }
      if (lowercased === 'false' || lowercased === '0' || lowercased === 'no') {
        return false;
      }
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    return defaultValue;
  }

  /**
   * Gets a number configuration value
   * @param {string} key - The configuration key
   * @param {number} defaultValue - Default value if key doesn't exist or is not a number
   * @returns {number} The number value or default
   */
  getNumber(key: string, defaultValue = 0): number {
    const value = this.get<any>(key);
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    return defaultValue;
  }

  /**
   * Gets a string configuration value
   * @param {string} key - The configuration key
   * @param {string} defaultValue - Default value if key doesn't exist
   * @returns {string} The string value or default
   */
  getString(key: string, defaultValue = ''): string {
    const value = this.get<any>(key);
    if (value === null || value === undefined) {
      return defaultValue;
    }
    if (typeof value === 'string') {
      return value;
    }
    return String(value);
  }

  /**
   * Gets an array configuration value
   * @param {string} key - The configuration key
   * @param {Array<T>} defaultValue - Default value if key doesn't exist or is not an array
   * @returns {Array<T>} The array value or default
   */
  getArray<T>(key: string, defaultValue: T[] = []): T[] {
    const value = this.get<any>(key);
    if (Array.isArray(value)) {
      return value as T[];
    }
    return defaultValue;
  }

  /**
   * Gets an object configuration value
   * @param {string} key - The configuration key
   * @param {Record<string, T>} defaultValue - Default value if key doesn't exist or is not an object
   * @returns {Record<string, T>} The object value or default
   */
  getObject<T>(key: string, defaultValue: Record<string, T> = {} as Record<string, T>): Record<string, T> {
    const value = this.get<any>(key);
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, T>;
    }
    return defaultValue;
  }

  /**
   * Gets a date configuration value
   * @param {string} key - The configuration key
   * @param {Date} defaultValue - Default value if key doesn't exist or is not convertible to a date
   * @returns {Date} The date value or default
   */
  getDate(key: string, defaultValue = new Date()): Date {
    const value = this.get<any>(key);
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return defaultValue;
  }

  /**
   * Gets the entire configuration object
   * @returns {Object} The configuration object
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Sets a configuration value
   * @param {string} key - The configuration key
   * @param {any} value - The value to set
   */
  set(key: string, value: any) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    let current = this.config;
    
    for (const k of keys) {
      if (current[k] === undefined || current[k] === null || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k] as any;
    }
    
    current[lastKey!] = value;
  }

  /**
   * Maps over all values in the configuration
   * @param {Function} callback - Function to call for each value
   * @returns {Object} New object with mapped values
   */
  map<T>(callback: (value: any, key: string) => T): Record<string, T> {
    const result: Record<string, T> = {};
    const flattenedConfig = this.flatten();
    
    for (const [key, value] of Object.entries(flattenedConfig)) {
      result[key] = callback(value, key);
    }
    
    return result;
  }

  /**
   * Maps over values in a specific section of the configuration
   * @param {string} section - The section to map over
   * @param {Function} callback - Function to call for each value
   * @returns {Object} New object with mapped values
   */
  mapSection<T>(section: string, callback: (value: any, key: string) => T): Record<string, T> | null {
    const sectionData = this.get(section);
    if (!sectionData || typeof sectionData !== 'object') {
      return null;
    }
    
    const result: Record<string, T> = {};
    for (const [key, value] of Object.entries(sectionData)) {
      result[key] = callback(value, key);
    }
    
    return result;
  }

  /**
   * Filters the configuration based on a predicate function
   * @param {Function} predicate - Function to test each value
   * @returns {Object} New filtered object
   */
  filter(predicate: (value: any, key: string) => boolean): Record<string, any> {
    const result: Record<string, any> = {};
    const flattenedConfig = this.flatten();
    
    for (const [key, value] of Object.entries(flattenedConfig)) {
      if (predicate(value, key)) {
        this.setNestedValue(result, key, value);
      }
    }
    
    return result;
  }

  /**
   * Flattens the configuration object into a single-level object with dot notation keys
   * @returns {Object} Flattened configuration
   */
  flatten(): Record<string, any> {
    const result: Record<string, any> = {};
    
    const flattenRecursive = (obj: Record<string, any>, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          flattenRecursive(value, newKey);
        } else {
          result[newKey] = value;
        }
      }
    };
    
    flattenRecursive(this.config);
    return result;
  }

  /**
   * Unflatten a dot-notation object back into a nested object
   * @param {Object} flatObj - Flattened object with dot notation keys
   * @returns {Object} Nested object
   */
  unflatten(flatObj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(flatObj)) {
      this.setNestedValue(result, key, value);
    }
    
    return result;
  }

  /**
   * Sets a value in a nested object structure using dot notation
   * @param {Object} obj - Object to modify
   * @param {string} path - Path in dot notation
   * @param {any} value - Value to set
   */
  private setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;
    
    for (const key of keys) {
      if (!(key in current) || current[key] === null || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey!] = value;
  }

  /**
   * Merges another configuration object into this one
   * @param {Object} configObject - Object to merge
   * @param {boolean} overwrite - Whether to overwrite existing values
   * @returns {JavaScriptConfiguration} This instance for chaining
   */
  merge(configObject: Record<string, any>, overwrite = true): JavaScriptConfiguration {
    const mergeRecursive = (target: Record<string, any>, source: Record<string, any>) => {
      for (const [key, value] of Object.entries(source)) {
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          if (!(key in target) || target[key] === null || typeof target[key] !== 'object') {
            target[key] = {};
          }
          mergeRecursive(target[key], value);
        } else if (overwrite || !(key in target)) {
          target[key] = value;
        }
      }
    };
    
    mergeRecursive(this.config, configObject);
    return this;
  }

  /**
   * Saves the configuration to the JavaScript file
   */
  save() {
    const configContent = `module.exports = ${this.stringifyConfig(this.config)};`;
    fs.writeFileSync(this.configPath, configContent, 'utf8');
  }

  /**
   * Helper method to stringify configuration object to JavaScript code
   * Preserves functions and handles circular references
   * @param {Object} obj - The object to stringify
   * @param {number} indent - Current indentation level
   * @returns {string} JavaScript code representation of the object
   */
  stringifyConfig(obj: object, indent = 0) {
    const spaces = '  '.repeat(indent + 1);
    const closingBraceSpaces = '  '.repeat(indent);
    const seen = new WeakSet();
    
    return JSON.stringify(obj, (key, value) => {
      // Handle circular references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      
      // Preserve functions as strings
      if (typeof value === 'function') {
        return value.toString();
      }
      
      return value;
    }, 2)
    .replace(/"function\s*\([^)]*\)\s*\{([\s\S]*)\}"/g, 'function($1}') // Restore functions
    .replace(/"(\w+)":/g, '$1:') // Remove quotes from keys
    .replace(/"\[Circular\]"/g, "'[Circular]'"); // Mark circular references
  }

  /**
   * Reloads the configuration from the file
   * @returns {Object} Fresh configuration object
   */
  reload() {
    this.config = this.loadConfig();
    return this.config;
  }

  exists() {
    return fs.existsSync(this.configPath);
  }

  setInitial() {
    this.config = this.defaults;
  }
}