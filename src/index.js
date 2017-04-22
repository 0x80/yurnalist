/* @flow */

import ConsoleReporter from './reporters/console/console-reporter';

type ReporterOptions = {
  emoji: boolean,
  verbose: boolean,
  progress: boolean,
  silent: boolean
};

const defaultConfig = {
  emoji: true,
  verbose: true,
  progress: true,
  silent: false,
};

export function createReporter(options: ReporterOptions): ConsoleReporter {
  const reporter = new ConsoleReporter({
    emoji: options.emoji &&
      process.stdout.isTTY &&
      process.platform === 'darwin',
    verbose: options.verbose,
    noProgress: !options.progress,
    isSilent: options.silent,
  });

  reporter.initPeakMemoryCounter();

  return reporter;
}

export default createReporter(defaultConfig);
