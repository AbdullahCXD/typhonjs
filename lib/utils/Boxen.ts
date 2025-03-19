import * as chalk from 'ansi-colors';

/**
 * Border styles for the TerminalBox
 */
export enum BorderStyle {
  SINGLE = 'single',
  DOUBLE = 'double',
  ROUND = 'round',
  BOLD = 'bold',
  CLASSIC = 'classic',
  NONE = 'none',
  SIMPLE = 'simple'  // New simpler style that works better in some terminals
}

/**
 * Options for customizing the TerminalBox
 */
export interface TerminalBoxOptions {
  padding?: number | { top: number; right: number; bottom: number; left: number };
  margin?: number | { top: number; right: number; bottom: number; left: number };
  borderStyle?: BorderStyle;
  borderColor?: string;
  backgroundColor?: string;
  align?: 'left' | 'center' | 'right';
  dimBorder?: boolean;
  title?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  float?: 'left' | 'right' | 'center';
  width?: number;
  fullWidth?: boolean;  // Use full terminal width
}

/**
 * Normalized padding/margin values
 */
interface BoxSpacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Border characters for each style
 */
const BORDER_CHARS = {
  [BorderStyle.SINGLE]: {
    topLeft: '┌',
    topRight: '┐',
    bottomRight: '┘',
    bottomLeft: '└',
    vertical: '│',
    horizontal: '─'
  },
  [BorderStyle.DOUBLE]: {
    topLeft: '╔',
    topRight: '╗',
    bottomRight: '╝',
    bottomLeft: '╚',
    vertical: '║',
    horizontal: '═'
  },
  [BorderStyle.ROUND]: {
    topLeft: '╭',
    topRight: '╮',
    bottomRight: '╯',
    bottomLeft: '╰',
    vertical: '│',
    horizontal: '─'
  },
  [BorderStyle.BOLD]: {
    topLeft: '┏',
    topRight: '┓',
    bottomRight: '┛',
    bottomLeft: '┗',
    vertical: '┃',
    horizontal: '━'
  },
  [BorderStyle.CLASSIC]: {
    topLeft: '+',
    topRight: '+',
    bottomRight: '+',
    bottomLeft: '+',
    vertical: '|',
    horizontal: '-'
  },
  [BorderStyle.SIMPLE]: {
    topLeft: '┌',
    topRight: '┐',
    bottomRight: '┘',
    bottomLeft: '└',
    vertical: '|',
    horizontal: '-'
  },
  [BorderStyle.NONE]: {
    topLeft: ' ',
    topRight: ' ',
    bottomRight: ' ',
    bottomLeft: ' ',
    vertical: ' ',
    horizontal: ' '
  }
};

/**
 * Class for creating boxes around text in the terminal
 */
export class TerminalBox {
  /**
   * Creates a box around the given text with the specified options
   * @param text The text to put in the box
   * @param options Options for customizing the box
   * @returns The text with a box around it
   */
  static create(text: string, options: TerminalBoxOptions = {}): string {
    // Default options
    const defaultOptions: TerminalBoxOptions = {
      padding: 1,
      margin: 0,
      borderStyle: BorderStyle.SIMPLE, // Changed default to SIMPLE for better compatibility
      borderColor: 'white',
      backgroundColor: '',
      align: 'left',
      dimBorder: false,
      titleAlignment: 'left',
      float: 'left',
      width: 0,
      fullWidth: false
    };

    // Merge default options with provided options
    const opts = { ...defaultOptions, ...options };

    // Normalize padding and margin
    const padding = TerminalBox.normalizeSpacing(opts.padding);
    const margin = TerminalBox.normalizeSpacing(opts.margin);

    // Get border characters
    const borderChars = BORDER_CHARS[opts.borderStyle ?? BorderStyle.SIMPLE];

    // Split text into lines
    const lines = text.split('\n');

    // Calculate content width
    let contentWidth = Math.max(...lines.map(line => {
      // Strip ANSI color codes for width calculation
      const plainText = line.replace(/\u001b\[\d+m/g, '');
      return plainText.length;
    }));
    
    if (opts.width && opts.width > contentWidth) {
      contentWidth = opts.width;
    }

    // Calculate box width
    const boxWidth = contentWidth + padding.left + padding.right;

    // Apply border styling
    const borderColor = opts.borderColor ? (chalk as any)[opts.borderColor] : chalk.white;
    const styleBorder = (char: string) => {
      let result = borderColor(char);
      if (opts.dimBorder) {
        result = chalk.dim(result);
      }
      return result;
    };

    // Create top border
    let result = '\n'.repeat(margin.top);
    const topBorder = styleBorder(borderChars.topLeft) +
      styleBorder(borderChars.horizontal.repeat(boxWidth)) +
      styleBorder(borderChars.topRight);
    result += ' '.repeat(margin.left) + topBorder + '\n';

    // Add padding top
    for (let i = 0; i < padding.top; i++) {
      result += ' '.repeat(margin.left) +
        styleBorder(borderChars.vertical) +
        ' '.repeat(boxWidth) +
        styleBorder(borderChars.vertical) +
        '\n';
    }

    // Add content lines
    for (const line of lines) {
      let paddedLine = line;
      // Strip ANSI color codes for width calculation
      const plainLine = line.replace(/\u001b\[\d+m/g, '');
      const lineLength = plainLine.length;
      const remainingSpace = contentWidth - lineLength;

      // Align text
      if (opts.align === 'center') {
        const leftPad = Math.floor(remainingSpace / 2);
        paddedLine = ' '.repeat(leftPad) + line + ' '.repeat(remainingSpace - leftPad);
      } else if (opts.align === 'right') {
        paddedLine = ' '.repeat(remainingSpace) + line;
      } else {
        paddedLine = line + ' '.repeat(remainingSpace);
      }

      // Add line to result
      result += ' '.repeat(margin.left) +
        styleBorder(borderChars.vertical) +
        ' '.repeat(padding.left) +
        paddedLine +
        ' '.repeat(padding.right) +
        styleBorder(borderChars.vertical) +
        '\n';
    }

    // Add padding bottom
    for (let i = 0; i < padding.bottom; i++) {
      result += ' '.repeat(margin.left) +
        styleBorder(borderChars.vertical) +
        ' '.repeat(boxWidth) +
        styleBorder(borderChars.vertical) +
        '\n';
    }

    // Add bottom border
    const bottomBorder = styleBorder(borderChars.bottomLeft) +
      styleBorder(borderChars.horizontal.repeat(boxWidth)) +
      styleBorder(borderChars.bottomRight);
    result += ' '.repeat(margin.left) + bottomBorder;

    // Add margin bottom
    result += '\n'.repeat(margin.bottom);

    return result;
  }

  /**
   * Normalizes padding or margin values
   * @param spacing The spacing value or object
   * @returns Normalized spacing values
   */
  private static normalizeSpacing(spacing: number | { top: number; right: number; bottom: number; left: number } | undefined): BoxSpacing {
    if (typeof spacing === 'number') {
      return { top: spacing, right: spacing, bottom: spacing, left: spacing };
    } else if (typeof spacing === 'object') {
      return {
        top: spacing.top || 0,
        right: spacing.right || 0,
        bottom: spacing.bottom || 0,
        left: spacing.left || 0
      };
    }
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
}