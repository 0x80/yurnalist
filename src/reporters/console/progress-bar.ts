import type { Stdout } from "../types";
import { clearLine, toStartOfLine } from "./utils";

const CHARS = ["#", "-"] as const;

export default class ProgressBar {
  constructor(
    total: number,
    stdout: Stdout = process.stderr,
    callback?: (progressBar: ProgressBar) => void
  ) {
    this.stdout = stdout;
    this.total = total;

    this.delay = 60;
    this.curr = 0;
    this.width = 10; // not sure what to pick here
    this._callback = callback;
    clearLine(stdout);
  }

  stdout: Stdout;
  curr: number;
  total: number;
  width: number;
  delay: number;
  id?: NodeJS.Timeout;
  _callback?: (progressBar: ProgressBar) => void;

  tick() {
    if (this.curr >= this.total) {
      return;
    }

    this.curr++;

    // schedule render
    if (!this.id) {
      this.id = setTimeout((): void => this.render(), this.delay);
    }
  }

  cancelTick() {
    if (this.id) {
      clearTimeout(this.id);
      this.id = undefined;
    }
  }

  stop() {
    // "stop" by setting current to end so `tick` becomes noop
    this.curr = this.total;

    this.cancelTick();
    clearLine(this.stdout);
    if (this._callback) {
      this._callback(this);
    }
  }

  render() {
    // clear throttle
    this.cancelTick();

    let ratio = this.curr / this.total;
    ratio = Math.min(Math.max(ratio, 0), 1);

    // progress without bar
    let bar = ` ${this.curr}/${this.total}`;

    // calculate size of actual bar
    const availableSpace = Math.max(0, this.stdout.columns - bar.length - 3);
    const width = Math.min(this.total, availableSpace);
    const completeLength = Math.round(width * ratio);
    const complete = CHARS[0].repeat(completeLength);
    const incomplete = CHARS[1].repeat(width - completeLength);
    bar = `[${complete}${incomplete}]${bar}`;

    toStartOfLine(this.stdout);
    this.stdout.write(bar);
  }
}
