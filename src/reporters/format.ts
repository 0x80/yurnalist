function formatFunction(...args: Array<string>): string {
  return args.join(" ");
}

export const defaultFormatter = {
  bold: formatFunction,
  dim: formatFunction,
  italic: formatFunction,
  underline: formatFunction,
  inverse: formatFunction,
  strikethrough: formatFunction,
  black: formatFunction,
  red: formatFunction,
  green: formatFunction,
  yellow: formatFunction,
  blue: formatFunction,
  magenta: formatFunction,
  cyan: formatFunction,
  white: formatFunction,
  gray: formatFunction,
  grey: formatFunction,
  stripColor: formatFunction,
};

type FormatFunction = typeof formatFunction;

export type FormatKeys = keyof typeof defaultFormatter;

export type Formatter = {
  bold: FormatFunction;
  dim: FormatFunction;
  italic: FormatFunction;
  underline: FormatFunction;
  inverse: FormatFunction;
  strikethrough: FormatFunction;
  black: FormatFunction;
  red: FormatFunction;
  green: FormatFunction;
  yellow: FormatFunction;
  blue: FormatFunction;
  magenta: FormatFunction;
  cyan: FormatFunction;
  white: FormatFunction;
  gray: FormatFunction;
  grey: FormatFunction;
  stripColor: FormatFunction;
};
