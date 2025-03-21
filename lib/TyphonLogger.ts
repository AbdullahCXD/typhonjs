import chalk from 'ansi-colors';
import cliProgress from 'cli-progress';
import { BorderStyle, TerminalBox } from './utils/Boxen';
import { TerminalMarkdown } from './utils/TerminalMarkdown';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * Custom figures object containing Unicode symbols for the TyphonLogger
 */
export const figures = {
  // Basic indicators
  tick: '✓',      // Used for success indicators
  cross: '✗',     // Used for error indicators
  info: 'ℹ',      // Used for info messages
  warning: '⚠',   // Used for warning messages
  bullet: '•',    // Used for debug messages

  // Progress indicators
  play: '▶',      // Used for starting sections
  pointer: '❯',   // Used for starting tasks
  pointerSmall: '›', // Used in progress bar format

  // Additional symbols that might be useful
  arrowRight: '→',
  arrowDown: '↓',
  arrowUp: '↑',
  arrowLeft: '←',
  radioOn: '◉',
  radioOff: '◯',
  checkboxOn: '☑',
  checkboxOff: '☐',
  ellipsis: '…',
  hamburger: '≡',
  heart: '♥',
  star: '★',
  warning2: '⚠️'
};

/**
 * Ultra-modern logger with advanced formatting, progress bars and structured output
 */
export class TyphonLogger {
  private static instance: TyphonLogger;
  private name: string;
  private level: LogLevel;
  private startTime: number;
  private indentLevel: number = 0;
  private progressBars: Map<string, cliProgress.SingleBar> = new Map();

  constructor(name: string, level: LogLevel = LogLevel.INFO) {
    this.name = name;
    this.level = level;
    this.startTime = Date.now();
  }

  static getInstance(name: string, level?: LogLevel): TyphonLogger {
    if (!TyphonLogger.instance) {
      TyphonLogger.instance = new TyphonLogger(name, level);
    }
    return TyphonLogger.instance;
  }

  debug(message: string): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(this.format(message, 'debug'));
    }
  }

  info(message: string): void {
    if (this.level <= LogLevel.INFO) {
      console.log(this.format(message, 'info'));
    }
  }

  warn(message: string): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.format(message, 'warn'));
    }
  }

  error(message: string): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.format(message, 'error'));
    }
  }

  success(message: string): void {
    if (this.level <= LogLevel.INFO) {
      console.log(this.format(message, 'success'));
    }
  }

  header(title: string): void {
    console.log('');
    console.log(TerminalBox.create(chalk.bold.cyan(` ${title} `), {
      padding: 0,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
      borderStyle: BorderStyle.ROUND,
      borderColor: 'cyan'
    }));
    console.log('');
  }

  startSection(title: string): void {
    this.info(`${chalk.cyan(figures.play)} ${chalk.bold(title)}`);
    this.indentLevel++;
  }

  endSection(title: string, success: boolean = true): void {
    this.indentLevel--;
    const symbol = success ? chalk.green(figures.tick) : chalk.red(figures.cross);
    this.info(`${symbol} ${chalk.bold(title)} ${chalk.gray(this.getTimestamp())}`);
  }

  startTask(id: string, title: string, total: number = 100): void {
    this.info(`${chalk.cyan(figures.pointer)} ${title}`);

    // Create multi bar container if it doesn't exist yet
    const progressBar = new cliProgress.SingleBar({
      format: `${chalk.cyan(figures.pointerSmall)} ${chalk.dim('{bar}')} ${chalk.cyan('{percentage}%')} | ${chalk.dim('{value}/{total}')} | ${chalk.dim('{eta}s')}`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    progressBar.start(total, 0);
    this.progressBars.set(id, progressBar);
  }

  updateTask(id: string, value: number): void {
    const bar = this.progressBars.get(id);
    if (bar) {
      bar.update(value);
    }
  }

  completeTask(id: string): void {
    const bar = this.progressBars.get(id);
    if (bar) {
      bar.stop();
      this.progressBars.delete(id);
    }
  }

  startBuild(): void {
    this.header(`${this.name} BUILD`);
    this.startTime = Date.now();
  }

  finishBuild(): void {
    const duration = this.getElapsedTime();
    console.log('');
    console.log(TerminalBox.create(
      `${chalk.green(figures.tick)} ${chalk.bold.green('BUILD SUCCESSFUL')}\n` +
      `${chalk.dim(`Completed in ${duration}`)}`,
      {
        padding: 1,
        margin: { top: 1, bottom: 1, right: 1, left: 1 },
        borderStyle: BorderStyle.ROUND,
        borderColor: 'green'
      }
    ));
  }

  failBuild(error?: Error | string): void {
    const duration = this.getElapsedTime();
    console.log('');
    console.log(TerminalBox.create(
      `${chalk.red(figures.cross)} ${chalk.bold.red('BUILD FAILED')}\n` +
      `${chalk.dim(`Failed after ${duration}`)}\n` +
      `${chalk.red(error instanceof Error ? error.message : String(error))}`,
      {
        padding: 1,
        margin: { top: 1, bottom: 1, right: 1, left: 1 },
        borderStyle: BorderStyle.ROUND,
        borderColor: 'red'
      }
    ));
  }

  private format(message: string, level: string): string {
    const indent = '  '.repeat(this.indentLevel);
    let prefix = '';

    switch (level) {
      case 'debug':
        prefix = chalk.dim(figures.bullet);
        break;
      case 'info':
        prefix = chalk.blue(figures.info);
        break;
      case 'warn':
        prefix = chalk.yellow(figures.warning);
        break;
      case 'error':
        prefix = chalk.red(figures.cross);
        break;
      case 'success':
        prefix = chalk.green(figures.tick);
        break;
      default:
        prefix = chalk.dim(figures.bullet);
    }

    return `${indent}${prefix} ${TerminalMarkdown.parse(message)}`;
  }

  private getTimestamp(): string {
    return `[${new Date().toISOString().split('T')[1].split('.')[0]}]`;
  }

  private getElapsedTime(): string {
    const elapsed = Date.now() - this.startTime;
    if (elapsed < 1000) {
      return `${elapsed}ms`;
    } else if (elapsed < 60000) {
      return `${(elapsed / 1000).toFixed(2)}s`;
    } else {
      const minutes = Math.floor(elapsed / 60000);
      const seconds = ((elapsed % 60000) / 1000).toFixed(0);
      return `${minutes}m ${seconds}s`;
    }
  }

  /**
 * Begin a collapsible group in the console with the given title
 * @param title The title of the group
 * @param collapsed Whether the group should be collapsed by default
 */
  group(title: string, collapsed: boolean = false): void {
    if (this.level <= LogLevel.INFO) {
      const groupMethod = collapsed ? console.groupCollapsed : console.group;
      groupMethod(this.format(`${chalk.bold(title)}`, 'info'));
      this.indentLevel++;
    }
  }

  /**
   * End the current group
   */
  groupEnd(): void {
    if (this.level <= LogLevel.INFO) {
      console.groupEnd();
      this.indentLevel--;
    }
  }

  /**
   * Log a message within a group and then end the group immediately
   * @param title The title of the group
   * @param message The message to log inside the group
   * @param level The log level for the message
   */
  groupedLog(title: string, message: string, level: 'debug' | 'info' | 'warn' | 'error' | 'success' = 'info'): void {
    this.group(title);

    switch (level) {
      case 'debug':
        this.debug(message);
        break;
      case 'info':
        this.info(message);
        break;
      case 'warn':
        this.warn(message);
        break;
      case 'error':
        this.error(message);
        break;
      case 'success':
        this.success(message);
        break;
    }

    this.groupEnd();
  }

  /**
   * Create a nested group structure and log messages within it
   * @param structure An object representing the nested group structure
   * @example
   * logger.nestedGroups({
   *   'Main Group': {
   *     'Subgroup 1': 'This is a message',
   *     'Subgroup 2': {
   *       'Nested group': 'Nested message'
   *     }
   *   }
   * });
   */
  nestedGroups(structure: Record<string, any>): void {
    for (const [title, content] of Object.entries(structure)) {
      if (typeof content === 'string') {
        this.groupedLog(title, content);
      } else if (typeof content === 'object' && content !== null) {
        this.group(title);
        this.nestedGroups(content);
        this.groupEnd();
      }
    }
  }

  /**
 * Log a table of data with optional styling
 * @param data The data to display in the table (array or object)
 * @param columns Optional array of column names to include
 */
  table(data: any[] | Record<string, any>, columns?: string[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(this.format('Table:', 'info'));

      if (columns) {
        console.table(data, columns);
      } else {
        console.table(data);
      }
    }
  }

  /**
   * Create and log a formatted ASCII table with custom styling
   * @param headers Array of column headers
   * @param rows Array of row data (each row should be an array with the same length as headers)
   * @param options Optional styling options
   */
  customTable(headers: string[], rows: any[][], options: {
    headerColor?: string,
    borderColor?: string,
    zebra?: boolean,
    align?: ('left' | 'center' | 'right')[]
  } = {}): void {
    if (this.level <= LogLevel.INFO) {
      const defaultOptions = {
        headerColor: 'cyan',
        borderColor: 'dim',
        zebra: true,
        align: headers.map(() => 'left' as const)
      };

      const opts = { ...defaultOptions, ...options };

      // Calculate column widths
      const colWidths = headers.map((h, i) => {
        const headerLength = h.length;
        const maxDataLength = rows.reduce((max, row) => {
          const cellLength = String(row[i] || '').length;
          return Math.max(max, cellLength);
        }, 0);
        return Math.max(headerLength, maxDataLength) + 2; // +2 for padding
      });

      const totalWidth = colWidths.reduce((sum, w) => sum + w, 0) + (headers.length + 1);

      // Helper for horizontal lines
      const horizontalLine = (char: string) => {
        const line = colWidths.map(w => char.repeat(w)).join('+');
        return (chalk as any)[opts.borderColor](`+${line}+`);
      };

      // Helper for formatting cell content
      const formatCell = (content: any, width: number, alignment: 'left' | 'center' | 'right'): string => {
        const str = String(content || '');
        const paddingTotal = Math.max(0, width - str.length);

        if (alignment === 'center') {
          const paddingLeft = Math.floor(paddingTotal / 2);
          const paddingRight = paddingTotal - paddingLeft;
          return ' '.repeat(paddingLeft) + str + ' '.repeat(paddingRight);
        } else if (alignment === 'right') {
          return ' '.repeat(paddingTotal) + str;
        } else {
          return str + ' '.repeat(paddingTotal);
        }
      };

      // Top border
      console.log(horizontalLine('─'));

      // Headers
      const headerRow = headers.map((h, i) =>
        (chalk as any).bold[opts.headerColor](formatCell(h, colWidths[i], opts.align[i]))
      ).join((chalk as any)[opts.borderColor]('│'));
      console.log((chalk as any)[opts.borderColor]('│') + headerRow + (chalk as any)[opts.borderColor]('│'));

      // Separator
      console.log(horizontalLine('═'));

      // Data rows
      rows.forEach((row, rowIndex) => {
        const isEven = rowIndex % 2 === 0;
        const rowColor = opts.zebra && !isEven ? chalk.dim : (text: string) => text;

        const formattedRow = row.map((cell, i) =>
          rowColor(formatCell(cell, colWidths[i], opts.align[i]))
        ).join((chalk as any)[opts.borderColor]('│'));

        console.log((chalk as any)[opts.borderColor]('│') + formattedRow + (chalk as any)[opts.borderColor]('│'));
      });

      // Bottom border
      console.log(horizontalLine('─'));
    }
  }

  /**
   * Log data as a structured key-value list
   * @param data An object containing key-value pairs to display
   * @param title Optional title for the key-value list
   */
  keyValue(data: Record<string, any>, title?: string): void {
    if (this.level <= LogLevel.INFO) {
      if (title) {
        console.log(this.format(`${chalk.bold(title)}:`, 'info'));
      }

      const indent = '  '.repeat(this.indentLevel + 1);
      const keyWidth = Math.max(...Object.keys(data).map(k => k.length)) + 2;

      for (const [key, value] of Object.entries(data)) {
        const formattedKey = chalk.cyan(`${key}:`.padEnd(keyWidth));

        let formattedValue;
        if (typeof value === 'object' && value !== null) {
          formattedValue = JSON.stringify(value);
        } else if (typeof value === 'boolean') {
          formattedValue = value ? chalk.green('true') : chalk.red('false');
        } else if (typeof value === 'number') {
          formattedValue = chalk.yellow(value.toString());
        } else {
          formattedValue = value;
        }

        console.log(`${indent}${formattedKey} ${formattedValue}`);
      }
    }
  }
}