import chalk from 'ansi-colors';
import { TyphonLogger, figures } from '../TyphonLogger';
import highlight from 'cli-highlight';
import { TerminalBox, BorderStyle } from './Boxen';

/**
 * Parser for converting markdown to colorized terminal output
 */
export class TerminalMarkdown {
  private indentLevel: number = 0;

  constructor() {
  }

  /**
   * Parse markdown text and return the colorized terminal output
   * @param markdown The markdown text to parse
   * @returns The colorized text as it would appear in terminal
   */
  parse(markdown: string): string {
    const lines = markdown.split('\n');
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeContent: string[] = [];
    let inList = false;
    let listLevel = 0;
    let output: string[] = [];

    // Process line by line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block handling
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          // Starting a code block
          inCodeBlock = true;
          codeLanguage = line.trim().substring(3).trim();
          codeContent = [];
          continue;
        } else {
          // Ending a code block
          inCodeBlock = false;
          output.push(this.renderCodeBlockToString(codeContent, codeLanguage));
          codeContent = [];
          continue;
        }
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // Blank line
      if (line.trim() === '') {
        output.push('');
        inList = false;
        continue;
      }

      // Headings
      if (line.startsWith('# ')) {
        output.push(...this.renderHeadingToString(line.substring(2), 1));
        continue;
      } else if (line.startsWith('## ')) {
        output.push(...this.renderHeadingToString(line.substring(3), 2));
        continue;
      } else if (line.startsWith('### ')) {
        output.push(...this.renderHeadingToString(line.substring(4), 3));
        continue;
      } else if (line.startsWith('#### ')) {
        output.push(...this.renderHeadingToString(line.substring(5), 4));
        continue;
      } else if (line.startsWith('##### ')) {
        output.push(...this.renderHeadingToString(line.substring(6), 5));
        continue;
      } else if (line.startsWith('###### ')) {
        output.push(...this.renderHeadingToString(line.substring(7), 6));
        continue;
      }

      // Horizontal rule
      if (line.match(/^[-*_]{3,}$/)) {
        output.push(chalk.dim('─'.repeat(80)));
        continue;
      }

      // Unordered list
      const unorderedMatch = line.match(/^(\s*)([*+-])\s(.+)$/);
      if (unorderedMatch) {
        const [, indent, bullet, content] = unorderedMatch;
        const level = indent.length / 2;
        output.push(this.renderUnorderedListItemToString(content, level));
        inList = true;
        listLevel = level;
        continue;
      }

      // Ordered list
      const orderedMatch = line.match(/^(\s*)(\d+)\.\s(.+)$/);
      if (orderedMatch) {
        const [, indent, number, content] = orderedMatch;
        const level = indent.length / 2;
        output.push(this.renderOrderedListItemToString(content, parseInt(number), level));
        inList = true;
        listLevel = level;
        continue;
      }

      // Blockquote
      if (line.startsWith('> ')) {
        output.push(this.renderBlockquoteToString(line.substring(2)));
        continue;
      }

      // If we reach here, it's a regular paragraph or inline formatting
      output.push(this.renderParagraphToString(line));
    }
    
    return output.join('\n');
  }

  /**
   * Parse a markdown string and return the colorized text without outputting
   * @param markdown The markdown text to parse
   * @returns The colorized text
   */
  parseToString(markdown: string): string {
    return this.parse(markdown);
  }

  /**
   * Render a heading with appropriate styling and return as string
   * @param content The heading content
   * @param level The heading level (1-6)
   * @returns Array of formatted strings
   */
  private renderHeadingToString(content: string, level: number): string[] {
    let formattedContent = this.parseInlineFormatting(content);
    let result: string[] = [];
    
    switch (level) {
      case 1:
        result.push(chalk.bold.cyan.underline(formattedContent.toUpperCase()));
        result.push('');
        break;
      case 2:
        result.push(chalk.bold.cyan(formattedContent));
        result.push('');
        break;
      case 3:
        result.push(chalk.bold.white(formattedContent));
        break;
      case 4:
      case 5:
      case 6:
        result.push(chalk.bold.dim(formattedContent));
        break;
    }
    
    return result;
  }

  /**
   * Render a code block with syntax highlighting and return as string
   * @param lines The lines of code
   * @param language The code language
   * @returns Formatted string with box around it
   */
  private renderCodeBlockToString(lines: string[], language: string): string {
    const code = lines.join('\n');
    let highlightedCode: string;
    
    try {
      // Apply syntax highlighting with cli-highlight
      highlightedCode = highlight(code, {
        language: language || 'plaintext',
        theme: {
          keyword: chalk.cyan,
          built_in: chalk.cyan,
          type: chalk.yellow.bold,
          literal: chalk.blue,
          number: chalk.green,
          regexp: chalk.red,
          string: chalk.green,
          comment: chalk.dim.italic,
          class: chalk.yellow.bold,
          function: chalk.magenta,
          title: chalk.magenta,
          params: chalk.cyan,
          tag: chalk.magenta,
          name: chalk.magenta,
          attr: chalk.cyan,
          symbol: chalk.blue,
          meta: chalk.dim,
          deletion: chalk.red.strikethrough,
          addition: chalk.green,
          variable: chalk.yellow
        }
      });
    } catch (error) {
      // Fallback if highlighting fails
      highlightedCode = chalk.yellow(code);
    }
    
    // Create a title based on language if available
    const title = language ? `${language.toUpperCase()} Code` : 'Code';
    
    // Use TerminalBox to create a box around the highlighted code
    return TerminalBox.create(highlightedCode, {
      borderStyle: BorderStyle.ROUND,
      borderColor: 'cyan',
      dimBorder: true,
      padding: { top: 1, right: 2, bottom: 1, left: 2 },
      title: title,
      titleAlignment: 'center'
    });
  }

  /**
   * Render an unordered list item and return as string
   * @param content The item content
   * @param level The nesting level
   * @returns Formatted string
   */
  private renderUnorderedListItemToString(content: string, level: number): string {
    const indent = '  '.repeat(level);
    const bulletSymbol = chalk.cyan(figures.bullet);
    const formattedContent = this.parseInlineFormatting(content);
    
    return `${indent}${bulletSymbol} ${formattedContent}`;
  }

  /**
   * Render an ordered list item and return as string
   * @param content The item content
   * @param number The item number
   * @param level The nesting level
   * @returns Formatted string
   */
  private renderOrderedListItemToString(content: string, number: number, level: number): string {
    const indent = '  '.repeat(level);
    const numberText = chalk.cyan(`${number}.`);
    const formattedContent = this.parseInlineFormatting(content);
    
    return `${indent}${numberText} ${formattedContent}`;
  }

  /**
   * Render a blockquote and return as string
   * @param content The blockquote content
   * @returns Formatted string
   */
  private renderBlockquoteToString(content: string): string {
    const formattedContent = this.parseInlineFormatting(content);
    const quoteSymbol = chalk.dim('│');
    
    return `${quoteSymbol} ${chalk.italic.dim(formattedContent)}`;
  }

  /**
   * Render a regular paragraph with inline formatting and return as string
   * @param content The paragraph content
   * @returns Formatted string
   */
  private renderParagraphToString(content: string): string {
    return this.parseInlineFormatting(content);
  }

  /**
   * Parse and apply inline markdown formatting (bold, italic, code, links)
   * @param text The text to parse
   * @returns Formatted text with ANSI color codes
   */
  private parseInlineFormatting(text: string): string {
    // Inline code
    text = text.replace(/`([^`]+)`/g, (_, code) => {
      return chalk.yellow(code);
    });

    // Bold (both ** and __ syntax)
    text = text.replace(/(\*\*|__)(.*?)\1/g, (_, marker, content) => {
      return chalk.bold(content);
    });

    // Italic (both * and _ syntax)
    text = text.replace(/(\*|_)(.*?)\1/g, (_, marker, content) => {
      return chalk.italic(content);
    });

    // Strikethrough
    text = text.replace(/~~(.*?)~~/g, (_, content) => {
      return chalk.dim.strikethrough(content);
    });

    // Links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, linkText, url) => {
      return `${chalk.blue.underline(linkText)} ${chalk.dim(`(${url})`)}`;
    });

    // Highlight (custom extension: ==text==)
    text = text.replace(/==(.*?)==/g, (_, content) => {
      return chalk.bgYellow.black(content);
    });

    return text;
  }

  /**
   * Parse markdown from a content and output to terminal
   * @param content Markdown content
   * @returns The colorized text as it would appear in terminal
   */
  static parse(content: string): string {
    
    try {
      const parser = new TerminalMarkdown();
      return parser.parse(content);
    } catch (error) {
      return chalk.red(`Error reading markdown file: ${(error as Error).message}`);
    }
  }

  /**
   * The original rendering methods are kept for backwards compatibility
   */
  private renderHeading(content: string, level: number): void {
    this.renderHeadingToString(content, level).forEach(line => console.log(line));
  }

  private renderCodeBlock(lines: string[], language: string): void {
    console.log(this.renderCodeBlockToString(lines, language));
  }

  private renderUnorderedListItem(content: string, level: number): void {
    console.log(this.renderUnorderedListItemToString(content, level));
  }

  private renderOrderedListItem(content: string, number: number, level: number): void {
    console.log(this.renderOrderedListItemToString(content, number, level));
  }

  private renderBlockquote(content: string): void {
    console.log(this.renderBlockquoteToString(content));
  }

  private renderParagraph(content: string): void {
    console.log(this.renderParagraphToString(content));
  }
}