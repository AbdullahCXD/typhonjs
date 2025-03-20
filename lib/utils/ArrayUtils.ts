/**
 * ArrayUtils - A utility class providing helpful array operations
 * that aren't available in the standard Array methods
 */
export class ArrayUtils {
  /**
   * Checks if two arrays are equal (same length and elements)
   * @param arr1 - First array
   * @param arr2 - Second array
   * @param strict - If true, uses strict equality (===), otherwise loose equality (==)
   * @returns True if arrays are equal
   */
  static equals<T>(arr1: T[], arr2: T[], strict: boolean = true): boolean {
    if (arr1 === arr2) return true;
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
      if (strict ? arr1[i] !== arr2[i] : arr1[i] != arr2[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns elements that exist in all provided arrays (intersection)
   * @param arrays - Arrays to find common elements in
   * @returns Array of common elements
   */
  static intersection<T>(...arrays: T[][]): T[] {
    if (!arrays || arrays.length === 0) return [];
    if (arrays.length === 1) return [...arrays[0]];

    return arrays.reduce(
      (result, current) => {
        return result.filter((element) => current.includes(element));
      },
      [...arrays[0]]
    );
  }

  /**
   * Returns unique elements from all provided arrays (union)
   * @param arrays - Arrays to combine
   * @returns Array of unique elements
   */
  static union<T>(...arrays: T[][]): T[] {
    if (!arrays || arrays.length === 0) return [];

    const result: T[] = [];
    const seen = new Set<T>();

    for (const arr of arrays) {
      for (const item of arr) {
        if (!seen.has(item)) {
          seen.add(item);
          result.push(item);
        }
      }
    }

    return result;
  }

  /**
   * Returns elements from first array that don't exist in any other provided arrays
   * @param array - Source array
   * @param arrays - Arrays to check against
   * @returns Array of elements unique to first array
   */
  static difference<T>(array: T[], ...arrays: T[][]): T[] {
    if (!array) return [];
    if (!arrays || arrays.length === 0) return [...array];

    const otherElements = new Set(arrays.flat());
    return array.filter((element) => !otherElements.has(element));
  }

  /**
   * Returns elements in either array but not both (symmetric difference)
   * @param arr1 - First array
   * @param arr2 - Second array
   * @returns Array of elements in either array but not both
   */
  static symmetricDifference<T>(arr1: T[], arr2: T[]): T[] {
    if (!arr1 && !arr2) return [];
    if (!arr1) return [...arr2];
    if (!arr2) return [...arr1];

    return [
      ...arr1.filter((item) => !arr2.includes(item)),
      ...arr2.filter((item) => !arr1.includes(item)),
    ];
  }

  /**
   * Checks if first array contains all elements from second array
   * @param arr1 - Container array
   * @param arr2 - Elements to check for
   * @returns True if first array contains all elements from second array
   */
  static containsAll<T>(arr1: T[], arr2: T[]): boolean {
    if (!arr1 || !arr2) return false;
    if (arr2.length === 0) return true;

    return arr2.every((element) => arr1.includes(element));
  }

  /**
   * Checks if first array contains any elements from second array
   * @param arr1 - Container array
   * @param arr2 - Elements to check for
   * @returns True if first array contains any elements from second array
   */
  static containsAny<T>(arr1: T[], arr2: T[]): boolean {
    if (!arr1 || !arr2) return false;
    if (arr2.length === 0) return false;

    return arr2.some((element) => arr1.includes(element));
  }

  /**
   * Counts occurrences of each element in the array
   * @param array - Input array
   * @returns Object with elements as keys and counts as values
   */
  static countOccurrences<T>(array: T[]): Record<string, number> {
    if (!array) return {};

    return array.reduce((counts, element) => {
      const key = String(element);
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }

  /**
   * Returns most frequent element(s) in the array
   * @param array - Input array
   * @param returnAll - If true, returns all elements with max frequency; otherwise just one
   * @returns Single element or array of elements that appear most frequently
   */
  static mostFrequent<T>(array: T[], returnAll: boolean = false): T | T[] {
    if (!array || array.length === 0)
      return returnAll ? [] : (undefined as any);

    const counts = ArrayUtils.countOccurrences(array);
    const maxCount = Math.max(...Object.values(counts));

    const mostFrequentElements = Object.keys(counts)
      .filter((key) => counts[key] === maxCount)
      .map((key) => {
        // Convert key back to original type if possible
        const original = array.find((item) => String(item) === key);
        return original !== undefined ? original : (key as unknown as T);
      });

    return returnAll ? mostFrequentElements : mostFrequentElements[0];
  }

  /**
   * Creates a new array with elements grouped into chunks of specified size
   * @param array - Input array
   * @param size - Chunk size
   * @returns Array of chunks
   */
  static chunk<T>(array: T[], size: number): T[][] {
    if (!array || size <= 0) return [];

    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }

    return result;
  }

  /**
   * Creates an array of unique elements (removes duplicates)
   * @param array - Input array
   * @returns Array with unique elements
   */
  static unique<T>(array: T[]): T[] {
    if (!array) return [];
    return [...new Set(array)];
  }

  /**
   * Returns duplicate elements from an array
   * @param array - Input array
   * @returns Array of duplicate elements
   */
  static duplicates<T>(array: T[]): T[] {
    if (!array) return [];

    const seen = new Set<T>();
    const duplicates = new Set<T>();

    array.forEach((item) => {
      if (seen.has(item)) {
        duplicates.add(item);
      } else {
        seen.add(item);
      }
    });

    return [...duplicates];
  }

  /**
   * Shuffles the elements of an array (Fisher-Yates algorithm)
   * @param array - Input array
   * @returns New shuffled array
   */
  static shuffle<T>(array: T[]): T[] {
    if (!array) return [];

    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  /**
   * Creates a range of numbers
   * @param start - Start of range (inclusive)
   * @param end - End of range (inclusive)
   * @param step - Step between numbers (default: 1)
   * @returns Array containing the range
   */
  static range(start: number, end: number, step: number = 1): number[] {
    if (step === 0) throw new Error("Step cannot be zero");

    const length = Math.floor((end - start) / step) + 1;
    if (length <= 0) return [];

    return Array.from({ length }, (_, i) => start + i * step);
  }

  /**
   * Splits an array into two arrays based on a predicate function
   * @param array - Input array
   * @param predicate - Function to determine which group an element belongs to
   * @returns Array containing two arrays: elements that pass the predicate and elements that don't
   */
  static partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
    if (!array) return [[], []];

    const passed: T[] = [];
    const failed: T[] = [];

    array.forEach((item) => {
      if (predicate(item)) {
        passed.push(item);
      } else {
        failed.push(item);
      }
    });

    return [passed, failed];
  }

  /**
   * Creates an array with all possible combinations of elements from input arrays
   * @param arrays - Input arrays
   * @returns Array of all combinations
   */
  static cartesianProduct<T>(...arrays: T[][]): T[][] {
    if (!arrays || arrays.length === 0) return [];
    if (arrays.some((arr) => arr.length === 0)) return [];

    return arrays.reduce(
      (acc, curr) => {
        return acc.flatMap((combo) => curr.map((item) => [...combo, item]));
      },
      [[] as T[]]
    );
  }

  /**
   * Computes the sum of all numbers in the array
   * @param array - Input array of numbers
   * @returns Sum of all numbers
   */
  static sum(array: number[]): number {
    if (!array || array.length === 0) return 0;
    return array.reduce((sum, num) => sum + num, 0);
  }

  /**
   * Computes the average of all numbers in the array
   * @param array - Input array of numbers
   * @returns Average value or NaN if array is empty
   */
  static average(array: number[]): number {
    if (!array || array.length === 0) return NaN;
    return ArrayUtils.sum(array) / array.length;
  }

  /**
   * Finds the minimum value in the array
   * @param array - Input array of numbers
   * @returns Minimum value or undefined if array is empty
   */
  static min(array: number[]): number | undefined {
    if (!array || array.length === 0) return undefined;
    return Math.min(...array);
  }

  /**
   * Finds the maximum value in the array
   * @param array - Input array of numbers
   * @returns Maximum value or undefined if array is empty
   */
  static max(array: number[]): number | undefined {
    if (!array || array.length === 0) return undefined;
    return Math.max(...array);
  }

  /**
   * Gets the median value of the array
   * @param array - Input array of numbers
   * @returns Median value or NaN if array is empty
   */
  static median(array: number[]): number {
    if (!array || array.length === 0) return NaN;

    const sorted = [...array].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }

  /**
   * Gets the mode (most common value(s)) of the array
   * @param array - Input array of numbers
   * @returns Array of mode values or empty array if input is empty
   */
  static mode(array: number[]): number[] {
    if (!array || array.length === 0) return [];
    return ArrayUtils.mostFrequent(array, true) as number[];
  }

  /**
   * Computes the variance of values in the array
   * @param array - Input array of numbers
   * @param sample - If true, calculates sample variance (n-1); otherwise population variance (n)
   * @returns Variance or NaN if array has fewer than 2 elements
   */
  static variance(array: number[], sample: boolean = true): number {
    if (!array || array.length < (sample ? 2 : 1)) return NaN;

    const mean = ArrayUtils.average(array);
    const squaredDifferences = array.map((num) => Math.pow(num - mean, 2));
    const divisor = sample ? array.length - 1 : array.length;

    return ArrayUtils.sum(squaredDifferences) / divisor;
  }

  /**
   * Computes the standard deviation of values in the array
   * @param array - Input array of numbers
   * @param sample - If true, calculates sample standard deviation; otherwise population
   * @returns Standard deviation or NaN if array has fewer than 2 elements
   */
  static standardDeviation(array: number[], sample: boolean = true): number {
    const variance = ArrayUtils.variance(array, sample);
    return isNaN(variance) ? NaN : Math.sqrt(variance);
  }

  /**
   * Flattens a nested array structure
   * @param array - Nested array
   * @param depth - Maximum depth to flatten (default: Infinity)
   * @returns Flattened array
   */
  static flatten<T>(array: any[], depth: number = Infinity): T[] {
    if (!array) return [];

    // Recursively flatten up to specified depth
    function flattenHelper(arr: any[], currentDepth: number): any[] {
      return arr.reduce((result, item) => {
        if (Array.isArray(item) && currentDepth < depth) {
          result.push(...flattenHelper(item, currentDepth + 1));
        } else {
          result.push(item);
        }
        return result;
      }, []);
    }

    return flattenHelper(array, 0);
  }

  /**
   * Gets all possible permutations of elements in the array
   * @param array - Input array
   * @returns Array of all permutations
   */
  static permutations<T>(array: T[]): T[][] {
    if (!array) return [];
    if (array.length === 0) return [[]];
    if (array.length === 1) return [array];

    const result: T[][] = [];

    for (let i = 0; i < array.length; i++) {
      const current = array[i];
      const remaining = [...array.slice(0, i), ...array.slice(i + 1)];
      const remainingPermutations = ArrayUtils.permutations(remaining);

      for (const permutation of remainingPermutations) {
        result.push([current, ...permutation]);
      }
    }

    return result;
  }

  /**
   * Gets all possible combinations of k elements from the array
   * @param array - Input array
   * @param k - Size of each combination
   * @returns Array of all combinations
   */
  static combinations<T>(array: T[], k: number): T[][] {
    if (!array || k < 0 || k > array.length) return [];
    if (k === 0) return [[]];
    if (k === array.length) return [array];

    // Helper function for combinations
    function combine(start: number, k: number): T[][] {
      if (k === 0) return [[]];

      const result: T[][] = [];

      for (let i = start; i <= array.length - k; i++) {
        const subCombinations = combine(i + 1, k - 1);
        for (const subCombo of subCombinations) {
          result.push([array[i], ...subCombo]);
        }
      }

      return result;
    }

    return combine(0, k);
  }

  /**
   * Creates an array of grouped elements based on the result of a grouping function
   * @param array - Input array
   * @param keyFn - Function to determine the group key for each element
   * @returns Object with keys as group names and values as arrays of elements
   */
  static groupBy<T, K extends string | number | symbol>(
    array: T[],
    keyFn: (item: T) => K
  ): Record<K, T[]> {
    if (!array) return {} as Record<K, T[]>;

    return array.reduce((result, item) => {
      const key = keyFn(item);
      result[key] = result[key] || [];
      result[key].push(item);
      return result;
    }, {} as Record<K, T[]>);
  }

  /**
   * Rotates array elements by the specified number of positions
   * @param array - Input array
   * @param positions - Number of positions to rotate (positive for right, negative for left)
   * @returns New rotated array
   */
  static rotate<T>(array: T[], positions: number): T[] {
    if (!array || array.length <= 1 || positions === 0)
      return array ? [...array] : [];

    const length = array.length;
    // Normalize positions to be within array length
    const normalizedPos = ((positions % length) + length) % length;

    if (normalizedPos === 0) return [...array];

    // Right rotation
    return [
      ...array.slice(length - normalizedPos),
      ...array.slice(0, length - normalizedPos),
    ];
  }

  /**
   * Creates a new array with specified element inserted at specified index
   * @param array - Input array
   * @param index - Index to insert element at
   * @param element - Element to insert
   * @returns New array with inserted element
   */
  static insert<T>(array: T[], index: number, element: T): T[] {
    if (!array) return [element];

    // Ensure index is within bounds
    const safeIndex = Math.max(0, Math.min(array.length, index));
    return [...array.slice(0, safeIndex), element, ...array.slice(safeIndex)];
  }

  /**
   * Creates a new array with element at specified index removed
   * @param array - Input array
   * @param index - Index of element to remove
   * @returns New array with removed element
   */
  static removeAt<T>(array: T[], index: number): T[] {
    if (!array || index < 0 || index >= array.length)
      return array ? [...array] : [];
    return [...array.slice(0, index), ...array.slice(index + 1)];
  }

  /**
   * Creates a new array with first occurrence of specified element removed
   * @param array - Input array
   * @param element - Element to remove
   * @returns New array with removed element
   */
  static remove<T>(array: T[], element: T): T[] {
    if (!array) return [];

    const index = array.indexOf(element);
    if (index === -1) return [...array];

    return ArrayUtils.removeAt(array, index);
  }

  /**
   * Creates a new array with all occurrences of specified element removed
   * @param array - Input array
   * @param element - Element to remove
   * @returns New array with all occurrences removed
   */
  static removeAll<T>(array: T[], element: T): T[] {
    if (!array) return [];
    return array.filter((item) => item !== element);
  }

  /**
   * Checks if an array is empty
   * @param array - Input array
   * @returns True if array is null, undefined, or empty
   */
  static isEmpty<T>(array: T[] | null | undefined): boolean {
    return !array || array.length === 0;
  }

  /**
   * Checks if an array is not empty
   * @param array - Input array
   * @returns True if array has at least one element
   */
  static isNotEmpty<T>(array: T[] | null | undefined): boolean {
    return !ArrayUtils.isEmpty(array);
  }

  /**
   * Creates a new array with elements that pass a truth test
   * @param array - Input array
   * @param predicate - Function to test each element
   * @returns New filtered array
   */
  static filterFalsy<T>(array: T[]): T[] {
    if (!array) return [];
    return array.filter(Boolean);
  }

  /**
   * Returns the first non-empty array from the arguments
   * @param arrays - Arrays to check
   * @returns First non-empty array or empty array if all are empty
   */
  static coalesce<T>(...arrays: (T[] | null | undefined)[]): T[] {
    for (const arr of arrays) {
      if (!ArrayUtils.isEmpty(arr)) {
        return arr as T[];
      }
    }
    return [];
  }

  /**
   * Creates an array from an array-like or iterable object
   * @param arrayLike - Array-like or iterable object
   * @returns New array
   */
  static from<T>(arrayLike: ArrayLike<T> | Iterable<T>): T[] {
    return Array.from(arrayLike);
  }

  /**
   * Gets the nth item from an array, supporting negative indices like Python
   * @param array - Input array
   * @param n - Index (negative counts from end)
   * @returns Element at specified index or undefined if out of bounds
   */
  static nth<T>(array: T[], n: number): T | undefined {
    if (!array) return undefined;

    // Convert negative index to positive
    const index = n < 0 ? array.length + n : n;

    if (index < 0 || index >= array.length) return undefined;
    return array[index];
  }

  /**
   * Compares two arrays for similarity (0-1 where 1 is identical)
   * @param arr1 - First array
   * @param arr2 - Second array
   * @returns Similarity score between 0 and 1
   */
  static similarity<T>(arr1: T[], arr2: T[]): number {
    if (!arr1 && !arr2) return 1.0;
    if (!arr1 || !arr2) return 0.0;

    const set1 = new Set(arr1);
    const set2 = new Set(arr2);

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    // Jaccard similarity coefficient
    return intersection.size / union.size;
  }

  /**
   * Zips multiple arrays together into pairs/tuples
   * @param arrays - Arrays to zip
   * @returns Array of tuples
   */
  static zip<T>(...arrays: T[][]): T[][] {
    if (!arrays || arrays.length === 0) return [];

    const minLength = Math.min(...arrays.map((arr) => (arr ? arr.length : 0)));
    const result: T[][] = [];

    for (let i = 0; i < minLength; i++) {
      result.push(arrays.map((arr) => arr[i]));
    }

    return result;
  }

  /**
   * Creates an array of all possible pairs from the input array
   * @param array - Input array
   * @returns Array of all possible pairs
   */
  static pairs<T>(array: T[]): [T, T][] {
    if (!array || array.length < 2) return [];

    const result: [T, T][] = [];

    for (let i = 0; i < array.length - 1; i++) {
      for (let j = i + 1; j < array.length; j++) {
        result.push([array[i], array[j]] as [T, T]);
      }
    }

    return result;
  }

  static filter<T>(
    array: T[],
    predicate: (value: T, index: number, array: T[]) => boolean
  ): T[] {
    const result: T[] = [];

    for (let i = 0; i < array.length; i++) {
      if (predicate(array[i], i, array)) {
        result.push(array[i]);
      }
    }

    return result;
  }
}
