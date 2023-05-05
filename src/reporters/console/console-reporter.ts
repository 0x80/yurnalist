import { default as chalk } from "chalk";
import inquirer, { Answers } from "inquirer";
import isCI from "is-ci";
import readline from "node:readline";
import tty from "node:tty";
import { inspect } from "node:util";
import read from "read";
import stripAnsi from "strip-ansi";
import { JsonValue } from "type-fest";
import { removeSuffix } from "~/utils/misc";
import BaseReporter, { ReporterOptions } from "../base-reporter";
import type { FormatKeys } from "../format";
import type {
  Package,
  PromptOptions,
  QuestionOptions,
  ReporterSelectOption,
  ReporterSetSpinner,
  ReporterSpinner,
  ReporterSpinnerSet,
} from "../types";
import Progress from "./progress-bar";
import Spinner from "./spinner-progress";
import { clearLine } from "./utils";

type Row = Array<string>;
// type InquirerResponses<K, T> = { [key: K]: Array<T> };

export class ConsoleReporter extends BaseReporter {
  constructor(opts: ReporterOptions = {}) {
    super(opts);

    this._lastCategorySize = 0;
    this._spinners = new Set();
    // @ts-expect-error weird construction here with stripColor
    this.format = chalk;
    this.format.stripColor = stripAnsi;
    this.isSilent = !!opts.silent;
  }

  _lastCategorySize: number;
  _progressBar?: Progress;
  _spinners: Set<Spinner>;

  _prependEmoji(msg: string, emoji?: string): string {
    if (this.emoji && emoji && this.isTTY) {
      msg = `${emoji}  ${msg}`;
    }
    return msg;
  }

  _logCategory(category: string, color: FormatKeys, msg: string) {
    this._lastCategorySize = category.length;
    this._log(`${this.format[color](category)} ${msg}`);
  }

  _verbose(msg: string) {
    this._logCategory("verbose", "grey", `${process.uptime()} ${msg}`);
  }

  _verboseInspect(obj: any) {
    this.inspect(obj);
  }

  close = () => {
    for (const spinner of this._spinners) {
      spinner.stop();
    }
    this._spinners.clear();
    this.stopProgress();
    super.close();
  };

  table = (head: Array<string>, body: Array<Row>) => {
    //
    head = head.map((field: string): string => this.format.underline(field));

    //
    const rows = [head].concat(body);

    // get column widths
    const cols: Array<number> = [];
    for (let i = 0; i < head.length; i++) {
      const widths = rows.map(
        (row: Row): number => this.format.stripColor(row[i]).length
      );
      cols[i] = Math.max(...widths);
    }

    //
    const builtRows = rows.map((row: Row): string => {
      for (let i = 0; i < row.length; i++) {
        const field = row[i];
        const padding = cols[i] - this.format.stripColor(field).length;

        row[i] = field + " ".repeat(padding);
      }
      return row.join(" ");
    });

    this.log(builtRows.join("\n"));
  };

  step = (current: number, total: number, msg: string, emoji?: string) => {
    msg = this._prependEmoji(msg, emoji);

    if (msg.endsWith("?")) {
      msg = `${removeSuffix(msg, "?")}...?`;
    } else {
      msg += "...";
    }

    this.log(`${this.format.dim(`[${current}/${total}]`)} ${msg}`);
  };

  inspect = (value: any) => {
    if (typeof value !== "number" && typeof value !== "string") {
      value = inspect(value, {
        breakLength: 0,
        colors: this.isTTY,
        depth: null,
        maxArrayLength: null,
      });
    }

    this.log(String(value), { force: true });
  };

  list = (
    title: string,
    items: Array<string>,
    hints?: Record<string, string>
  ) => {
    /**
     * Because in the original Yarn code list() is called starting with a "key:
     * string" argument that is ignored, we don't assume that a title has been
     * passed in or is a valid string, to avoid creating a breaking change.
     */
    this._logCategory(
      "list",
      "magenta",
      typeof title === "string" ? this.format.bold(title) : ""
    );

    const gutterWidth = (this._lastCategorySize || 2) - 1;

    if (hints) {
      for (const item of items) {
        this._log(`${" ".repeat(gutterWidth)}- ${this.format.bold(item)}`);
        this._log(`  ${" ".repeat(gutterWidth)} ${hints[item]}`);
      }
    } else {
      for (const item of items) {
        this._log(`${" ".repeat(gutterWidth)}- ${item}`);
      }
    }
  };

  header = (command: string, pkg: Package) => {
    this.log(this.format.bold(`${pkg.name} ${command} v${pkg.version}`));
  };

  footer = (showPeakMemory?: boolean) => {
    this.stopProgress();

    const totalTime = (this.getTotalTime() / 1000).toFixed(2);
    let msg = `Done in ${totalTime}s.`;
    if (showPeakMemory) {
      const peakMemory = (this.peakMemory / 1024 / 1024).toFixed(2);
      msg += ` Peak memory usage ${peakMemory}MB.`;
    }
    this.log(this._prependEmoji(msg, "✨"));
  };

  log = (msg: string, { force = false }: { force?: boolean } = {}) => {
    this._lastCategorySize = 0;
    this._log(msg, { force });
  };

  _log(msg: string, { force = false }: { force?: boolean } = {}) {
    if (this.isSilent && !force) {
      return;
    }
    clearLine(this.stdout);
    this.stdout.write(`${msg}\n`);
  }

  success = (msg: string) => {
    this._logCategory("success", "green", msg);
  };

  error = (msg: string) => {
    clearLine(this.stderr);
    this.stderr.write(`${this.format.red("error")} ${msg}\n`);
  };

  info = (msg: string) => {
    this._logCategory("info", "blue", msg);
  };

  command = (command: string) => {
    this.log(this.format.dim(`$ ${command}`));
  };

  warn = (msg: string) => {
    clearLine(this.stderr);
    this.stderr.write(`${this.format.yellow("warning")} ${msg}\n`);
  };

  question = (
    question: string,
    options: QuestionOptions = {}
  ): Promise<string> => {
    if (!process.stdout.isTTY) {
      return Promise.reject(
        new Error("Can't answer a question unless a user TTY")
      );
    }

    return new Promise((resolve, reject) => {
      read(
        {
          prompt: `${this.format.dim("question")} ${question}: `,
          silent: !!options.password,
          output: this.stdout,
          input: this.stdin,
        },
        (err, answer) => {
          if (err) {
            if (err.message === "canceled") {
              process.exitCode = 1;
            }
            reject(err);
          } else {
            if (!answer && options.required) {
              this.error(this.lang("answerRequired"));
              resolve(this.question(question, options));
            } else {
              resolve(answer);
            }
          }
        }
      );
    });
  };
  // handles basic tree output to console
  // tree(key: string, trees: Trees, { force = false }: { force?: boolean } = {}) {
  //   this.stopProgress();
  //   //
  //   if (this.isSilent && !force) {
  //     return;
  //   }
  //   const output = (
  //     { name, children, hint, color }: TreeState,
  //     titlePrefix: string,
  //     childrenPrefix: string
  //   ) => {
  //     const formatter = this.format;
  //     const out = getFormattedOutput({
  //       prefix: titlePrefix,
  //       hint,
  //       color,
  //       name,
  //       formatter,
  //     });
  //     this.stdout.write(out);

  //     if (children && children.length) {
  //       recurseTree(sortTrees(children), childrenPrefix, output);
  //     }
  //   };
  //   recurseTree(sortTrees(trees), "", output);
  // }

  activitySet = (total: number, workers: number): ReporterSpinnerSet => {
    if (!this.isTTY || this.noProgress) {
      return super.activitySet(total, workers);
    }

    const spinners: Array<ReporterSetSpinner> = [];
    const reporterSpinners = this._spinners;

    for (let i = 1; i < workers; i++) {
      this.log("");
    }

    for (let i = 0; i < workers; i++) {
      const spinner = new Spinner(this.stderr, i);
      reporterSpinners.add(spinner);
      spinner.start();

      let prefix: string | undefined;
      let current = 0;
      const updatePrefix = () => {
        spinner.setPrefix(
          `${this.format.dim(`[${current === 0 ? "-" : current}/${total}]`)} `
        );
      };
      const clear = () => {
        prefix = undefined;
        current = 0;
        updatePrefix();
        spinner.setText("waiting...");
      };
      clear();

      spinners.unshift({
        clear,

        setPrefix(_current: number, _prefix: string) {
          current = _current;
          prefix = _prefix;
          spinner.setText(prefix);
          updatePrefix();
        },

        tick(msg: string) {
          if (prefix) {
            msg = `${prefix}: ${msg}`;
          }
          spinner.setText(msg);
        },

        end() {
          spinner.stop();
          reporterSpinners.delete(spinner);
        },
      });
    }

    return {
      spinners,
      end: () => {
        for (const spinner of spinners) {
          spinner.end();
        }
        readline.moveCursor(this.stdout, 0, -workers + 1);
      },
    };
  };

  activity = (): ReporterSpinner => {
    if (!this.isTTY || this.isSilent || isCI) {
      return {
        tick: () => {
          /*noop*/
        },
        end: () => {
          /*noop*/
        },
      };
    }
    const reporterSpinners = this._spinners;

    const spinner = new Spinner(this.stderr);
    spinner.start();

    reporterSpinners.add(spinner);

    return {
      tick(name: string) {
        spinner.setText(name);
      },

      end() {
        spinner.stop();
        reporterSpinners.delete(spinner);
      },
    };
  };

  select = (
    header: string,
    question: string,
    options: Array<ReporterSelectOption>
  ): Promise<string> => {
    if (!this.isTTY) {
      return Promise.reject(
        new Error("Can't answer a question unless a user TTY")
      );
    }

    const rl = readline.createInterface({
      input: this.stdin,
      output: this.stdout,
      terminal: true,
    });

    const questions = options.map((opt): string => opt.name);
    const answers = options.map((opt): string => opt.value);

    function toIndex(input: string): number {
      const index = answers.indexOf(input);

      if (index >= 0) {
        return index;
      } else {
        return +input;
      }
    }

    return new Promise((resolve) => {
      this.info(header);

      for (let i = 0; i < questions.length; i++) {
        this.log(`  ${this.format.dim(`${i + 1})`)} ${questions[i]}`);
      }

      const ask = () => {
        rl.question(`${question}: `, (input) => {
          let index = toIndex(input);

          if (isNaN(index)) {
            this.log("Not a number");
            ask();
            return;
          }

          if (index <= 0 || index > options.length) {
            this.log("Outside answer range");
            ask();
            return;
          }

          // get index
          index--;
          rl.close();
          resolve(answers[index]);
        });
      };

      ask();
    });
  };

  progress = (count: number): (() => void) => {
    if (this.noProgress || count <= 0) {
      return function () {
        // noop
      };
    }

    if (!this.isTTY || this.isSilent || isCI) {
      return function () {
        // TODO what should the behaviour here be? we could buffer progress messages maybe
      };
    }

    // Clear any potentially old progress bars
    this.stopProgress();

    const bar = (this._progressBar = new Progress(
      count,
      this.stderr,
      (progress: Progress) => {
        if (progress === this._progressBar) {
          this._progressBar = undefined;
        }
      }
    ));

    bar.render();

    return function () {
      bar.tick();
    };
  };

  stopProgress = () => {
    if (this._progressBar) {
      this._progressBar.stop();
    }
  };

  async prompt<T>(
    message: string,
    choices: Array<unknown>,
    options: PromptOptions = {}
  ): Promise<Array<T>> {
    if (!process.stdout.isTTY) {
      return Promise.reject(
        new Error("Can't answer a question unless a user TTY")
      );
    }

    let pageSize;
    if (process.stdout instanceof tty.WriteStream) {
      pageSize = process.stdout.rows - 2;
    }

    const rl = readline.createInterface({
      input: this.stdin,
      output: this.stdout,
      terminal: true,
    });

    const prompt = inquirer.createPromptModule({
      input: this.stdin,
      output: this.stdout,
    });

    const { name = "prompt", type = "input", validate } = options;
    const answers: Answers = await prompt([
      { name, type, message, choices, pageSize, validate },
    ]);

    rl.close();

    return answers[name];
  }
}