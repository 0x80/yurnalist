import { ConsoleReporter } from "./reporters/console/console-reporter";
import { Stdin, Stdout } from "./reporters/types";
import { boolifyWithDefault } from "./utils/conversion";

export type ApiReporterOptions = {
  verbose?: boolean;
  stdout?: Stdout;
  stderr?: Stdout;
  stdin?: Stdin;
  emoji?: boolean;
  noProgress?: boolean;
  silent?: boolean;
  nonInteractive?: boolean;
  peekMemoryCounter?: boolean;
};

const defaultOptions = {
  emoji: true,
  peekMemoryCounter: false,
};

export function createReporter(
  options: ApiReporterOptions = {}
): ConsoleReporter {
  const reporter = new ConsoleReporter({
    emoji: options.emoji && process.stdout.isTTY,
    verbose: options.verbose,
    noProgress: options.noProgress,
    silent:
      boolifyWithDefault(process.env.YURNALIST_SILENT, false) || options.silent,
    nonInteractive: options.nonInteractive,
  });

  if (options.peekMemoryCounter) {
    reporter.initPeakMemoryCounter();
  }

  return reporter;
}

export default createReporter(defaultOptions);
