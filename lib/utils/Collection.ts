/**
 * A Collection class that extends Map with additional utility functions
 * @template K The type of keys in the collection
 * @template V The type of values in the collection
 */
class Collection<K, V> extends Map<K, V> {
    /**
     * Creates a new Collection
     * @param entries Initial entries for the collection
     */
    constructor(entries?: readonly (readonly [K, V])[] | null) {
      super(entries);
    }
  
    /**
     * Returns the first value in the collection
     * @returns The first value or undefined if collection is empty
     */
    first(): V | undefined {
      return this.values().next().value;
    }
  
    /**
     * Returns the first key in the collection
     * @returns The first key or undefined if collection is empty
     */
    firstKey(): K | undefined {
      return this.keys().next().value;
    }
  
    /**
     * Returns the last value in the collection
     * @returns The last value or undefined if collection is empty
     */
    last(): V | undefined {
      if (this.size === 0) return undefined;
      const values = Array.from(this.values());
      return values[values.length - 1];
    }
  
    /**
     * Returns the last key in the collection
     * @returns The last key or undefined if collection is empty
     */
    lastKey(): K | undefined {
      if (this.size === 0) return undefined;
      const keys = Array.from(this.keys());
      return keys[keys.length - 1];
    }
  
    /**
     * Returns a random value from the collection
     * @returns A random value or undefined if collection is empty
     */
    random(): V | undefined {
      if (this.size === 0) return undefined;
      const values = Array.from(this.values());
      return values[Math.floor(Math.random() * values.length)];
    }
  
    /**
     * Returns a random key from the collection
     * @returns A random key or undefined if collection is empty
     */
    randomKey(): K | undefined {
      if (this.size === 0) return undefined;
      const keys = Array.from(this.keys());
      return keys[Math.floor(Math.random() * keys.length)];
    }
  
    /**
     * Returns an array of collection values
     * @returns Array containing all values
     */
    toArray(): V[] {
      return Array.from(this.values());
    }
  
    /**
     * Returns an array of collection keys
     * @returns Array containing all keys
     */
    keyArray(): K[] {
      return Array.from(this.keys());
    }
  
    /**
     * Returns an array of [key, value] pairs
     * @returns Array of entries
     */
    entriesArray(): [K, V][] {
      return Array.from(this.entries());
    }
  
    /**
     * Maps each value to a new value using the provided function
     * @param fn Function to transform each value
     * @returns New Collection with transformed values
     */
    map<T>(fn: (value: V, key: K, collection: this) => T): Collection<K, T> {
      const newCollection = new Collection<K, T>();
      for (const [key, value] of this.entries()) {
        newCollection.set(key, fn(value, key, this));
      }
      return newCollection;
    }
  
    /**
     * Maps each key to a new key using the provided function
     * @param fn Function to transform each key
     * @returns New Collection with transformed keys
     */
    mapKeys<T>(fn: (key: K, value: V, collection: this) => T): Collection<T, V> {
      const newCollection = new Collection<T, V>();
      for (const [key, value] of this.entries()) {
        newCollection.set(fn(key, value, this), value);
      }
      return newCollection;
    }
  
    /**
     * Creates a new collection with items that pass the filter function
     * @param fn Function to test each value
     * @returns Filtered collection
     */
    filter(fn: (value: V, key: K, collection: this) => boolean): Collection<K, V> {
      const newCollection = new Collection<K, V>();
      for (const [key, value] of this.entries()) {
        if (fn(value, key, this)) {
          newCollection.set(key, value);
        }
      }
      return newCollection;
    }
  
    /**
     * Finds the first value that satisfies the provided function
     * @param fn Function to test each value
     * @returns The found value or undefined
     */
    find(fn: (value: V, key: K, collection: this) => boolean): V | undefined {
      for (const [key, value] of this.entries()) {
        if (fn(value, key, this)) {
          return value;
        }
      }
      return undefined;
    }
  
    /**
     * Finds the key of the first value that satisfies the provided function
     * @param fn Function to test each value
     * @returns The found key or undefined
     */
    findKey(fn: (value: V, key: K, collection: this) => boolean): K | undefined {
      for (const [key, value] of this.entries()) {
        if (fn(value, key, this)) {
          return key;
        }
      }
      return undefined;
    }
  
    /**
     * Applies a function to each value in the collection
     * @param fn Function to execute for each value
     * @returns This collection
     */
    forEach(fn: (value: V, key: K, collection: this) => void): this {
      for (const [key, value] of this.entries()) {
        fn(value, key, this);
      }
      return this;
    }
  
    /**
     * Checks if all values pass the provided function
     * @param fn Function to test each value
     * @returns Boolean indicating if all values passed
     */
    every(fn: (value: V, key: K, collection: this) => boolean): boolean {
      for (const [key, value] of this.entries()) {
        if (!fn(value, key, this)) {
          return false;
        }
      }
      return true;
    }
  
    /**
     * Checks if any value passes the provided function
     * @param fn Function to test each value
     * @returns Boolean indicating if any value passed
     */
    some(fn: (value: V, key: K, collection: this) => boolean): boolean {
      for (const [key, value] of this.entries()) {
        if (fn(value, key, this)) {
          return true;
        }
      }
      return false;
    }
  
    /**
     * Reduces the collection to a single value
     * @param fn Function to execute on each value
     * @param initialValue Initial value for the accumulator
     * @returns The final accumulated value
     */
    reduce<T>(fn: (accumulator: T, value: V, key: K, collection: this) => T, initialValue: T): T {
      let accumulator = initialValue;
      for (const [key, value] of this.entries()) {
        accumulator = fn(accumulator, value, key, this);
      }
      return accumulator;
    }
  
    /**
     * Sorts the collection by a provided sorting function
     * @param compareFn Function to determine the sort order
     * @returns New sorted collection
     */
    sort(compareFn?: (a: V, b: V) => number): Collection<K, V> {
      const entries = Array.from(this.entries());
      entries.sort((a, b) => compareFn ? compareFn(a[1], b[1]) : 0);
      return new Collection<K, V>(entries);
    }
  
    /**
     * Sorts the collection by keys using a provided sorting function
     * @param compareFn Function to determine the sort order
     * @returns New sorted collection
     */
    sortByKey(compareFn?: (a: K, b: K) => number): Collection<K, V> {
      const entries = Array.from(this.entries());
      entries.sort((a, b) => compareFn ? compareFn(a[0], b[0]) : String(a[0]).localeCompare(String(b[0])));
      return new Collection<K, V>(entries);
    }
  
    /**
     * Returns a portion of the collection as a new collection
     * @param start Start index
     * @param end End index (excluding)
     * @returns New collection with the portion of elements
     */
    slice(start?: number, end?: number): Collection<K, V> {
      const entries = Array.from(this.entries()).slice(start, end);
      return new Collection<K, V>(entries);
    }
  
    /**
     * Gets multiple items from the collection
     * @param keys Keys of the items to get
     * @returns Array of values corresponding to the keys (undefined if key doesn't exist)
     */
    getMany(keys: K[]): (V | undefined)[] {
      return keys.map(key => this.get(key));
    }
  
    /**
     * Deletes multiple items from the collection
     * @param keys Keys of the items to delete
     * @returns Number of items removed
     */
    deleteMany(keys: K[]): number {
      let count = 0;
      for (const key of keys) {
        if (this.delete(key)) {
          count++;
        }
      }
      return count;
    }
  
    /**
     * Sets multiple key-value pairs in the collection
     * @param entries Array of key-value pairs to set
     * @returns This collection
     */
    setMany(entries: [K, V][]): this {
      for (const [key, value] of entries) {
        this.set(key, value);
      }
      return this;
    }
  
    /**
     * Merges another collection or map into this one
     * @param collection Collection to merge
     * @param overwrite Whether to overwrite existing keys
     * @returns This collection
     */
    merge(collection: Collection<K, V> | Map<K, V>, overwrite = true): this {
      for (const [key, value] of collection.entries()) {
        if (overwrite || !this.has(key)) {
          this.set(key, value);
        }
      }
      return this;
    }
  
    /**
     * Creates a clone of this collection
     * @returns New collection with the same entries
     */
    clone(): Collection<K, V> {
      return new Collection<K, V>(Array.from(this.entries()));
    }
  
    /**
     * Partitions the collection into two collections based on a condition
     * @param fn Function that returns true or false
     * @returns Array with two collections: one with items that passed and one with items that failed
     */
    partition(fn: (value: V, key: K, collection: this) => boolean): [Collection<K, V>, Collection<K, V>] {
      const truthy = new Collection<K, V>();
      const falsy = new Collection<K, V>();
  
      for (const [key, value] of this.entries()) {
        if (fn(value, key, this)) {
          truthy.set(key, value);
        } else {
          falsy.set(key, value);
        }
      }
  
      return [truthy, falsy];
    }
  
    /**
     * Checks if this collection equals another collection
     * (same size and same key-value pairs)
     * @param collection Collection to compare with
     * @returns Boolean indicating equality
     */
    equals(collection: Collection<K, V> | Map<K, V>): boolean {
      if (this.size !== collection.size) return false;
      
      for (const [key, value] of this.entries()) {
        if (!collection.has(key) || collection.get(key) !== value) {
          return false;
        }
      }
      
      return true;
    }
  
    /**
     * Groups collection values by a key determined by the callback function
     * @param keyFn Function that returns the group key for a value
     * @returns Collection of collections grouped by keys
     */
    groupBy<T>(keyFn: (value: V, key: K, collection: this) => T): Collection<T, Collection<K, V>> {
      const groups = new Collection<T, Collection<K, V>>();
      
      for (const [key, value] of this.entries()) {
        const groupKey = keyFn(value, key, this);
        
        if (!groups.has(groupKey)) {
          groups.set(groupKey, new Collection<K, V>());
        }
        
        groups.get(groupKey)!.set(key, value);
      }
      
      return groups;
    }
  
    /**
     * Gets the key for a specific value
     * @param searchValue Value to find the key for
     * @param fromIndex Index to start searching from
     * @returns Key or undefined if not found
     */
    keyOf(searchValue: V): K | undefined {
      for (const [key, value] of this.entries()) {
        if (Object.is(value, searchValue)) {
          return key;
        }
      }
      return undefined;
    }
  
    /**
     * Returns all keys for a specific value
     * @param searchValue Value to find keys for
     * @returns Array of keys
     */
    keysOf(searchValue: V): K[] {
      const result: K[] = [];
      for (const [key, value] of this.entries()) {
        if (Object.is(value, searchValue)) {
          result.push(key);
        }
      }
      return result;
    }
  
    /**
     * Swaps two keys in the collection
     * @param key1 First key
     * @param key2 Second key
     * @returns This collection
     */
    swap(key1: K, key2: K): this {
      if (this.has(key1) && this.has(key2)) {
        const val1 = this.get(key1)!;
        const val2 = this.get(key2)!;
        this.set(key1, val2);
        this.set(key2, val1);
      }
      return this;
    }
  
    /**
     * Removes entries that satisfy the provided function
     * @param fn Function to test each entry
     * @returns Number of removed entries
     */
    sweep(fn: (value: V, key: K, collection: this) => boolean): number {
      const keysToRemove: K[] = [];
      
      for (const [key, value] of this.entries()) {
        if (fn(value, key, this)) {
          keysToRemove.push(key);
        }
      }
      
      for (const key of keysToRemove) {
        this.delete(key);
      }
      
      return keysToRemove.length;
    }
  
    /**
     * Removes entries that have duplicate values
     * @param keepLast Whether to keep the last encountered entry (default: false - keeps the first)
     * @returns This collection
     */
    removeDuplicates(keepLast = false): this {
      const values = new Set<V>();
      const keysToRemove: K[] = [];
      
      if (keepLast) {
        // Iterate in reverse to keep last entries
        const entries = Array.from(this.entries());
        for (let i = entries.length - 1; i >= 0; i--) {
          const [key, value] = entries[i];
          if (values.has(value)) {
            keysToRemove.push(key);
          } else {
            values.add(value);
          }
        }
      } else {
        // Iterate normally to keep first entries
        for (const [key, value] of this.entries()) {
          if (values.has(value)) {
            keysToRemove.push(key);
          } else {
            values.add(value);
          }
        }
      }
      
      for (const key of keysToRemove) {
        this.delete(key);
      }
      
      return this;
    }
  
    /**
     * Converts the collection to an object
     * @returns Object representation of the collection
     */
    toObject(): Record<string, V> {
      const obj: Record<string, V> = {} as Record<string, V>;
      for (const [key, value] of this.entries()) {
        obj[String(key)] = value;
      }
      return obj;
    }
  
    /**
     * Creates a new collection with specified properties of each value
     * @param props Properties to pick from each value
     * @returns New collection with picked properties
     */
    pluck<T extends keyof V>(prop: T): Collection<K, V[T]> {
      return this.map(value => value[prop]);
    }
  
    /**
     * Paginate the collection
     * @param page Page number (1-based)
     * @param pageSize Number of items per page
     * @returns Collection containing the items for the requested page
     */
    paginate(page: number, pageSize: number): Collection<K, V> {
      const startIndex = (page - 1) * pageSize;
      return this.slice(startIndex, startIndex + pageSize);
    }
  
    /**
     * Get the total number of pages based on a page size
     * @param pageSize Number of items per page
     * @returns Total number of pages
     */
    pageCount(pageSize: number): number {
      return Math.ceil(this.size / pageSize);
    }
  
    /**
     * Chain multiple operations and get the result
     * @param fn Function to apply operations on the collection
     * @returns Result of the operations
     */
    tap<R>(fn: (collection: this) => R): R {
      return fn(this);
    }
  
    /**
     * Applies specified function to collection and returns collection
     * @param fn Function to apply to the collection
     * @returns This collection
     */
    each(fn: (collection: this) => void): this {
      fn(this);
      return this;
    }
  
    /**
     * Get a subset of the collection with the specified keys
     * @param keys The keys to include
     * @returns New collection with only the specified keys
     */
    pick(keys: K[]): Collection<K, V> {
      const newCollection = new Collection<K, V>();
      for (const key of keys) {
        if (this.has(key)) {
          newCollection.set(key, this.get(key)!);
        }
      }
      return newCollection;
    }
  
    /**
     * Get a subset of the collection excluding the specified keys
     * @param keys The keys to exclude
     * @returns New collection without the specified keys
     */
    omit(keys: K[]): Collection<K, V> {
      const keysSet = new Set(keys);
      const newCollection = new Collection<K, V>();
      
      for (const [key, value] of this.entries()) {
        if (!keysSet.has(key)) {
          newCollection.set(key, value);
        }
      }
      
      return newCollection;
    }
  
    /**
     * Update multiple values using a transform function
     * @param keys Keys to update
     * @param transformFn Function to transform the values
     * @returns This collection
     */
    updateMany(keys: K[], transformFn: (value: V, key: K) => V): this {
      for (const key of keys) {
        if (this.has(key)) {
          this.set(key, transformFn(this.get(key)!, key));
        }
      }
      return this;
    }
  
    /**
     * Ensures a key exists, setting a default value if it doesn't
     * @param key The key to ensure exists
     * @param defaultValue The default value or function to generate it
     * @returns The existing or new value
     */
    ensure(key: K, defaultValue: V | (() => V)): V {
      if (!this.has(key)) {
        const value = typeof defaultValue === 'function' 
          ? (defaultValue as () => V)() 
          : defaultValue;
        this.set(key, value);
        return value;
      }
      return this.get(key)!;
    }
  
    /**
     * Counts the number of values that satisfy a predicate
     * @param predicate Function to test each value
     * @returns Count of values that satisfy the predicate
     */
    count(predicate: (value: V, key: K) => boolean): number {
      let count = 0;
      for (const [key, value] of this.entries()) {
        if (predicate(value, key)) {
          count++;
        }
      }
      return count;
    }
  
    /**
     * Get a value or throw if it doesn't exist
     * @param key The key to get
     * @param errorMessage Optional custom error message
     * @returns The value
     * @throws Error if the key doesn't exist
     */
    getOrThrow(key: K, errorMessage?: string): V {
      if (!this.has(key)) {
        throw new Error(errorMessage || `Key "${String(key)}" not found in collection`);
      }
      return this.get(key)!;
    }
  
    /**
     * Inverts the collection, using values as keys and keys as values
     * @returns New collection with keys and values swapped
     */
    invert(): Collection<V, K> {
      const newCollection = new Collection<V, K>();
      for (const [key, value] of this.entries()) {
        newCollection.set(value, key);
      }
      return newCollection;
    }
  
    /**
     * Creates a collection from an object
     * @param obj Object to convert
     * @returns New collection
     */
    static from<K extends string | number | symbol, V>(obj: Record<K, V>): Collection<K, V> {
      const collection = new Collection<K, V>();
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          collection.set(key as K, obj[key]);
        }
      }
      return collection;
    }
  
    /**
     * Creates a collection from an array using a key selector
     * @param array Array to convert
     * @param keySelector Function to extract a key from each item
     * @returns New collection
     */
    static fromArray<K, V>(array: V[], keySelector: (item: V, index: number) => K): Collection<K, V> {
      const collection = new Collection<K, V>();
      array.forEach((item, index) => {
        collection.set(keySelector(item, index), item);
      });
      return collection;
    }
  
    /**
     * Creates a collection by mapping values from another collection
     * @param collection Source collection
     * @param mapFn Function to transform each value
     * @returns New collection
     */
    static mapValues<K, V, R>(collection: Collection<K, V> | Map<K, V>, mapFn: (value: V, key: K) => R): Collection<K, R> {
      const result = new Collection<K, R>();
      for (const [key, value] of collection.entries()) {
        result.set(key, mapFn(value, key));
      }
      return result;
    }
  
    /**
     * Creates a new empty collection of the same type
     * @returns New empty collection
     */
    static empty<K, V>(): Collection<K, V> {
      return new Collection<K, V>();
    }
  
    /**
     * Creates a collection filled with a specified number of elements
     * @param count Number of elements
     * @param valueGenerator Function to generate values
     * @param keyGenerator Function to generate keys
     * @returns New filled collection
     */
    static fill<K, V>(
      count: number, 
      valueGenerator: (index: number) => V,
      keyGenerator: (index: number) => K
    ): Collection<K, V> {
      const collection = new Collection<K, V>();
      for (let i = 0; i < count; i++) {
        collection.set(keyGenerator(i), valueGenerator(i));
      }
      return collection;
    }
  }
  
  export default Collection;