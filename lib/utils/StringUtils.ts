/**
 * StringUtils - A utility class providing helpful string operations 
 * that aren't available in the standard String class
 */
export class StringUtils {
    /**
     * Truncates a string to the specified length and adds an ellipsis if truncated
     * @param str - The input string
     * @param maxLength - Maximum length before truncation
     * @param ellipsis - String to append if truncated (default: '...')
     * @returns Truncated string with ellipsis if needed
     */
    static truncate(str: string, maxLength: number, ellipsis: string = '...'): string {
      if (!str || str.length <= maxLength) return str;
      return str.substring(0, maxLength - ellipsis.length) + ellipsis;
    }
  
    /**
     * Checks if a string contains only alphanumeric characters
     * @param str - The input string
     * @returns True if string contains only alphanumeric characters
     */
    static isAlphanumeric(str: string): boolean {
      return /^[a-zA-Z0-9]+$/.test(str);
    }
  
    /**
     * Converts a string to title case (capitalizes first letter of each word)
     * @param str - The input string
     * @returns Title cased string
     */
    static toTitleCase(str: string): string {
      if (!str) return str;
      return str.replace(/\b\w+/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
    }
  
    /**
     * Converts a camelCase or PascalCase string to kebab-case
     * @param str - The input string
     * @returns kebab-case string
     */
    static toKebabCase(str: string): string {
      return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/\s+/g, '-')
        .toLowerCase();
    }
  
    /**
     * Converts a camelCase or PascalCase string to snake_case
     * @param str - The input string
     * @returns snake_case string
     */
    static toSnakeCase(str: string): string {
      return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/\s+/g, '_')
        .toLowerCase();
    }
  
    /**
     * Converts a kebab-case or snake_case string to camelCase
     * @param str - The input string
     * @returns camelCase string
     */
    static toCamelCase(str: string): string {
      return str
        .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
        .replace(/^[A-Z]/, firstChar => firstChar.toLowerCase());
    }
  
    /**
     * Returns a random string of specified length
     * @param length - Length of random string
     * @param chars - Characters to use (default: alphanumeric)
     * @returns Random string
     */
    static random(length: number, chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
  
    /**
     * Counts occurrences of a substring in a string
     * @param str - The input string
     * @param substring - Substring to count
     * @param caseSensitive - Whether to perform case-sensitive matching (default: true)
     * @returns Number of occurrences
     */
    static countOccurrences(str: string, substring: string, caseSensitive: boolean = true): number {
      if (!str || !substring) return 0;
      
      if (!caseSensitive) {
        str = str.toLowerCase();
        substring = substring.toLowerCase();
      }
      
      let count = 0;
      let position = str.indexOf(substring);
      
      while (position !== -1) {
        count++;
        position = str.indexOf(substring, position + 1);
      }
      
      return count;
    }
  
    /**
     * Extracts all email addresses from a string
     * @param str - The input string
     * @returns Array of email addresses
     */
    static extractEmails(str: string): string[] {
      if (!str) return [];
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      return str.match(emailRegex) || [];
    }
  
    /**
     * Extracts all URLs from a string
     * @param str - The input string
     * @returns Array of URLs
     */
    static extractUrls(str: string): string[] {
      if (!str) return [];
      const urlRegex = /https?:\/\/[^\s]+/g;
      return str.match(urlRegex) || [];
    }
  
    /**
     * Removes all HTML tags from a string
     * @param str - The input string with HTML
     * @returns String with HTML tags removed
     */
    static stripHtml(str: string): string {
      if (!str) return str;
      return str.replace(/<[^>]*>/g, '');
    }
  
    /**
     * Slugifies a string (for URLs)
     * @param str - The input string
     * @returns URL-friendly slug
     */
    static slugify(str: string): string {
      if (!str) return '';
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, '')         // Remove leading/trailing hyphens
        .replace(/-+/g, '-');            // Replace multiple hyphens with single hyphen
    }
  
    /**
     * Checks if a string is a valid JSON
     * @param str - The input string
     * @returns True if valid JSON
     */
    static isValidJson(str: string): boolean {
      if (!str) return false;
      try {
        JSON.parse(str);
        return true;
      } catch (e) {
        return false;
      }
    }
  
    /**
     * Escapes a string for use in a regular expression
     * @param str - The input string
     * @returns Escaped string
     */
    static escapeRegExp(str: string): string {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  
    /**
     * Returns part of a string before the first occurrence of a delimiter
     * @param str - The input string
     * @param delimiter - The delimiter
     * @returns Substring before delimiter or original string if not found
     */
    static beforeFirst(str: string, delimiter: string): string {
      if (!str) return '';
      const index = str.indexOf(delimiter);
      return index === -1 ? str : str.substring(0, index);
    }
  
    /**
     * Returns part of a string after the last occurrence of a delimiter
     * @param str - The input string
     * @param delimiter - The delimiter
     * @returns Substring after delimiter or empty string if not found
     */
    static afterLast(str: string, delimiter: string): string {
      if (!str) return '';
      const index = str.lastIndexOf(delimiter);
      return index === -1 ? '' : str.substring(index + delimiter.length);
    }
  
    /**
     * Wraps each word in a string with specified prefix and suffix
     * @param str - The input string
     * @param prefix - Prefix to add before each word
     * @param suffix - Suffix to add after each word
     * @returns String with wrapped words
     */
    static wrapWords(str: string, prefix: string, suffix: string): string {
      if (!str) return '';
      return str.replace(/\b(\w+)\b/g, `${prefix}$1${suffix}`);
    }
  
    /**
     * Converts newlines to HTML <br> tags
     * @param str - The input string
     * @returns String with newlines converted to <br> tags
     */
    static nl2br(str: string): string {
      if (!str) return '';
      return str.replace(/\n/g, '<br>');
    }
  
    /**
     * Removes excess whitespace from a string
     * @param str - The input string
     * @returns Normalized string
     */
    static normalizeWhitespace(str: string): string {
      if (!str) return '';
      return str.replace(/\s+/g, ' ').trim();
    }
  
    /**
     * Checks if a string is a palindrome (reads the same backward as forward)
     * @param str - The input string
     * @param ignoreCase - Whether to ignore case (default: true)
     * @param ignoreNonAlphanumeric - Whether to ignore non-alphanumeric chars (default: true)
     * @returns True if palindrome
     */
    static isPalindrome(str: string, ignoreCase: boolean = true, ignoreNonAlphanumeric: boolean = true): boolean {
      if (!str) return false;
      
      let processedStr = str;
      
      if (ignoreNonAlphanumeric) {
        processedStr = processedStr.replace(/[^a-zA-Z0-9]/g, '');
      }
      
      if (ignoreCase) {
        processedStr = processedStr.toLowerCase();
      }
      
      const reversed = [...processedStr].reverse().join('');
      return processedStr === reversed;
    }
  
    /**
     * Compares two strings for equality with options for case sensitivity
     * @param str1 - First string
     * @param str2 - Second string
     * @param caseSensitive - Whether to perform case-sensitive comparison (default: true)
     * @returns True if the strings are equal
     */
    static equals(str1: string, str2: string, caseSensitive: boolean = true): boolean {
      if (str1 === str2) return true;
      if (!str1 || !str2) return false;
      
      return caseSensitive ? str1 === str2 : str1.toLowerCase() === str2.toLowerCase();
    }
  
    /**
     * Checks if a string equals any of the strings in the provided array
     * @param str - String to check
     * @param values - Array of strings to compare against
     * @param caseSensitive - Whether to perform case-sensitive comparison (default: true)
     * @returns True if the string equals any of the values
     */
    static equalsAny(str: string, values: string[], caseSensitive: boolean = true): boolean {
      if (!str || !values || values.length === 0) return false;
      
      return values.some(value => StringUtils.equals(str, value, caseSensitive));
    }
  
    /**
     * Checks if a string contains all of the specified substrings
     * @param str - String to check
     * @param substrings - Array of substrings to look for
     * @param caseSensitive - Whether to perform case-sensitive search (default: true)
     * @returns True if the string contains all substrings
     */
    static containsAll(str: string, substrings: string[], caseSensitive: boolean = true): boolean {
      if (!str || !substrings || substrings.length === 0) return false;
      
      const searchStr = caseSensitive ? str : str.toLowerCase();
      
      return substrings.every(substring => {
        const searchSubstring = caseSensitive ? substring : substring.toLowerCase();
        return searchStr.includes(searchSubstring);
      });
    }
  
    /**
     * Checks if a string contains any of the specified substrings
     * @param str - String to check
     * @param substrings - Array of substrings to look for
     * @param caseSensitive - Whether to perform case-sensitive search (default: true)
     * @returns True if the string contains any of the substrings
     */
    static containsAny(str: string, substrings: string[], caseSensitive: boolean = true): boolean {
      if (!str || !substrings || substrings.length === 0) return false;
      
      const searchStr = caseSensitive ? str : str.toLowerCase();
      
      return substrings.some(substring => {
        const searchSubstring = caseSensitive ? substring : substring.toLowerCase();
        return searchStr.includes(searchSubstring);
      });
    }
  
    /**
     * Checks if a string starts with any of the specified prefixes
     * @param str - String to check
     * @param prefixes - Array of prefixes to check
     * @param caseSensitive - Whether to perform case-sensitive comparison (default: true)
     * @returns True if the string starts with any of the prefixes
     */
    static startsWithAny(str: string, prefixes: string[], caseSensitive: boolean = true): boolean {
      if (!str || !prefixes || prefixes.length === 0) return false;
      
      const searchStr = caseSensitive ? str : str.toLowerCase();
      
      return prefixes.some(prefix => {
        const searchPrefix = caseSensitive ? prefix : prefix.toLowerCase();
        return searchStr.startsWith(searchPrefix);
      });
    }
  
    /**
     * Checks if a string ends with any of the specified suffixes
     * @param str - String to check
     * @param suffixes - Array of suffixes to check
     * @param caseSensitive - Whether to perform case-sensitive comparison (default: true)
     * @returns True if the string ends with any of the suffixes
     */
    static endsWithAny(str: string, suffixes: string[], caseSensitive: boolean = true): boolean {
      if (!str || !suffixes || suffixes.length === 0) return false;
      
      const searchStr = caseSensitive ? str : str.toLowerCase();
      
      return suffixes.some(suffix => {
        const searchSuffix = caseSensitive ? suffix : suffix.toLowerCase();
        return searchStr.endsWith(searchSuffix);
      });
    }
  
    /**
     * Calculates the Levenshtein distance between two strings
     * (minimum number of single-character edits required to change one string into the other)
     * @param str1 - First string
     * @param str2 - Second string
     * @returns The Levenshtein distance
     */
    static levenshteinDistance(str1: string, str2: string): number {
      if (!str1) return str2 ? str2.length : 0;
      if (!str2) return str1.length;
      
      const matrix: number[][] = [];
      
      // Initialize the matrix
      for (let i = 0; i <= str1.length; i++) {
        matrix[i] = [i];
      }
      
      for (let j = 0; j <= str2.length; j++) {
        matrix[0][j] = j;
      }
      
      // Fill in the matrix
      for (let i = 1; i <= str1.length; i++) {
        for (let j = 1; j <= str2.length; j++) {
          const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,         // deletion
            matrix[i][j - 1] + 1,         // insertion
            matrix[i - 1][j - 1] + cost   // substitution
          );
        }
      }
      
      return matrix[str1.length][str2.length];
    }
  
    /**
     * Calculates the similarity between two strings (0-1 where 1 is identical)
     * based on Levenshtein distance
     * @param str1 - First string
     * @param str2 - Second string
     * @returns Similarity score between 0 and 1
     */
    static similarity(str1: string, str2: string): number {
      if (!str1 && !str2) return 1.0;
      if (!str1 || !str2) return 0.0;
      
      const distance = StringUtils.levenshteinDistance(str1, str2);
      const maxLength = Math.max(str1.length, str2.length);
      
      if (maxLength === 0) return 1.0;
      return 1.0 - distance / maxLength;
    }
  
    /**
     * Reverse a string
     * @param str - String to reverse
     * @returns Reversed string
     */
    static reverse(str: string): string {
      if (!str) return str;
      return [...str].reverse().join('');
    }
  
    /**
     * Rotate a string by the specified number of positions
     * @param str - String to rotate
     * @param positions - Number of positions to rotate (positive for right, negative for left)
     * @returns Rotated string
     */
    static rotate(str: string, positions: number): string {
      if (!str || positions === 0) return str;
      
      const length = str.length;
      if (length <= 1) return str;
      
      // Normalize positions to be within string length
      const normalizedPos = ((positions % length) + length) % length;
      
      if (normalizedPos === 0) return str;
      
      // Right rotation
      return str.slice(length - normalizedPos) + str.slice(0, length - normalizedPos);
    }
  
    /**
     * Checks if a string is composed of repeating substrings
     * @param str - String to check
     * @returns True if the string is composed of repeating substrings
     */
    static isRepeated(str: string): boolean {
      if (!str || str.length <= 1) return false;
      
      const length = str.length;
      
      // Try different potential substring lengths
      for (let i = 1; i <= length / 2; i++) {
        // Only check if the length is divisible by i
        if (length % i !== 0) continue;
        
        const pattern = str.substring(0, i);
        let repeated = true;
        
        // Check if the pattern repeats throughout the string
        for (let j = i; j < length; j += i) {
          if (str.substring(j, j + i) !== pattern) {
            repeated = false;
            break;
          }
        }
        
        if (repeated) return true;
      }
      
      return false;
    }
  
    /**
     * Calculates the Hamming distance between two strings of equal length
     * (number of positions at which corresponding symbols differ)
     * @param str1 - First string
     * @param str2 - Second string
     * @returns Hamming distance or -1 if strings have different lengths
     */
    static hammingDistance(str1: string, str2: string): number {
      if (!str1 || !str2) return -1;
      if (str1.length !== str2.length) return -1;
      
      let distance = 0;
      for (let i = 0; i < str1.length; i++) {
        if (str1[i] !== str2[i]) {
          distance++;
        }
      }
      
      return distance;
    }
  
    /**
     * Determines if two strings are anagrams of each other
     * @param str1 - First string
     * @param str2 - Second string
     * @param ignoreCase - Whether to ignore case (default: true)
     * @param ignoreSpaces - Whether to ignore spaces (default: true)
     * @returns True if strings are anagrams
     */
    static isAnagram(str1: string, str2: string, ignoreCase: boolean = true, ignoreSpaces: boolean = true): boolean {
      if (!str1 || !str2) return false;
      
      let s1 = str1;
      let s2 = str2;
      
      if (ignoreCase) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();
      }
      
      if (ignoreSpaces) {
        s1 = s1.replace(/\s+/g, '');
        s2 = s2.replace(/\s+/g, '');
      }
      
      if (s1.length !== s2.length) return false;
      
      // Sort characters and compare
      return [...s1].sort().join('') === [...s2].sort().join('');
    }
  
    /**
     * Checks if a string is empty, null, or contains only whitespace
     * @param str - String to check
     * @returns True if the string is empty, null, or contains only whitespace
     */
    static isBlank(str: string | null | undefined): boolean {
      return str === null || str === undefined || str.trim() === '';
    }
  
    /**
     * Checks if a string is not empty, null, or whitespace-only
     * @param str - String to check
     * @returns True if the string is not empty, null, or whitespace-only
     */
    static isNotBlank(str: string | null | undefined): boolean {
      return !StringUtils.isBlank(str);
    }
  
    /**
     * Returns the first non-blank string from the arguments
     * @param values - Strings to check
     * @returns First non-blank string or empty string if all are blank
     */
    static coalesce(...values: (string | null | undefined)[]): string {
      for (const value of values) {
        if (!StringUtils.isBlank(value)) {
          return value as string;
        }
      }
      return '';
    }
  
    /**
     * Centers a string in a field of a specified width
     * @param str - String to center
     * @param width - Width of the field
     * @param padChar - Character to pad with (default: ' ')
     * @returns Centered string
     */
    static center(str: string, width: number, padChar: string = ' '): string {
      if (!str || width <= str.length) return str;
      
      const paddingTotal = width - str.length;
      const paddingLeft = Math.floor(paddingTotal / 2);
      const paddingRight = paddingTotal - paddingLeft;
      
      return padChar.repeat(paddingLeft) + str + padChar.repeat(paddingRight);
    }
  }