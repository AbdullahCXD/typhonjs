import chalk from 'ansi-colors';
import cliProgress from 'cli-progress';
import { BorderStyle, TerminalBox } from './utils/Boxen';

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
    
    return `${indent}${prefix} ${message}`;
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
}