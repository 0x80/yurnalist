/* @flow */

import ConsoleReporter from './reporters/console/console-reporter';
import {boolifyWithDefault} from './util/conversion.js';
import type {Stdout, Stdin} from './reporters/types.js';

export type ApiReporterOptions = {
  verbose?: boolean,
  stdout?: Stdout,
  stderr?: Stdout,
  stdin?: Stdin,
  emoji?: boolean,
  noProgress?: boolean,
  silent?: boolean,
  nonInteractive?: boolean,
  peekMemoryCounter?: boolean,
};

const defaultOptions = {
  emoji: true,
  peekMemoryCounter: false,
};

/**
 * This code is based on yarn src/cli/index.js
 */
function createReporter(options?: ApiReporterOptions = {}): ConsoleReporter {
  const reporter = new ConsoleReporter({
    emoji: options.emoji && process.stdout.isTTY,
    verbose: options.verbose,
    noProgress: options.noProgress,
    isSilent: boolifyWithDefault(process.env.YURNALIST_SILENT, false) || options.silent,
    nonInteractive: options.nonInteractive,
  });

  if (options.peekMemoryCounter) {
    reporter.initPeakMemoryCounter();
  }

  return reporter;
}

const reporter = createReporter(defaultOptions);

function bindMethods(methods: string[], instance): Object {
  return methods.reduce((result, name) => {
    try {
      /* $FlowFixMe: Indexible signature not found */
      result[name] = instance[name].bind(instance);
      return result;
    } catch (e) {
      throw new ReferenceError(`Unable to bind method: ${name}`);
    }
  }, {});
}

const boundMethods = bindMethods(
  [
    'table',
    'step',
    'inspect',
    'list',
    'header',
    'footer',
    'log',
    'success',
    'error',
    'info',
    'command',
    'warn',
    'question',
    'tree',
    'activitySet',
    'activity',
    'select',
    'progress',
    'close',
    'lang',
  ],
  reporter,
);

module.exports = Object.assign({}, boundMethods, {createReporter});
