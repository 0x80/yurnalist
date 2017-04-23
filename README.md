# Yurnalist
Elegant console output borrowed from Yarn.

## Introduction
Nicely styled console output makes you happy. Yarn is doing a really nice job with that. Yurnalist extracts the part of Yarn responsible for that and makes it available for standalone use in any other Node.js commandline tools.

Yurnalist can be used to display many differnt things in the console besides simple messages, including activity spinners, processing steps, objects, lists, trees and tables.

User input for questions and selection is also available.

## Install
```shell
$ yarn add yurnalist@alpha
```
Or if your prefer NPM
```shell
$ npm install yurnalist@alpha
```

## How to use

```javascript
import report from 'yurnalist'

/* A function to fake some async task */
function doSomeWork(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchSomething() {
  report.info('Wait while I fetch something for you');
  report.warn('It might take a little while though');

  const spinner = report.activity();
  spinner.tick('I am on it');

  try {
    await doSomeWork(3000);
    report.success('Done!');
  } catch (err) {
    report.error(err);
  }

  spinner.end();
}

fetchSomething().then(report.close())
```

When initialized the reporter opens a stream, which means you have to close it after you are done with the program, otherwise it won't stop. I'm still figuring out if this is really neccesary to expose in the API. Suggestions are welcome of course.

The normal import/require statement returns a singleton instance of the reporter. Calling close() on it will therefor also close the stream for other modules that use it.

To create multiple instances (with possibly different configurations) use the `createReporter()` API.

## API
Coming soon...

### table
### step
### inspect
### list
### header
### footer
### log
### success
### error
### info
### command
### warn
### question
### tree
### activitySet
### activity
### select
### progress
### close
### createReporter


## Configuration
A normal import gives you a reporter instance configured with defaults for easy use. If you want something else you can call `createReporter(options)` to give you an instance with different options.

### Options

These are the options of the reporter as defined by Flow:

```javascript
type ReporterOptions = {
  verbose?: boolean,
  language?: Language,
  stdout?: Stdout,
  stderr?: Stdout,
  stdin?: Stdin,
  emoji?: boolean,
  noProgress?: boolean,
  silent?: boolean,
};
```

The defaults used are:

```javascript
const defaults = {
  verbose: false,
  language: 'en',
  stdout: process.stdout,
  stderr: process.stderr,
  stdin: process.stdinn,
  emoji: true,
  noProgress: false,
  silent: false
}
```

Yarn uses a language file for certain messages. For example if you try to skip a required question, or when you pick an invalid item from a select. This language file is not yet exposed in the Yurnalist API. The only supported language is English by using 'en'.

## Examples
Examples showing different API functions are found in [/examples](/examples). You can run them directly with node >= 7.6 (because of async/await syntax). For older versions you could use the `--harmony` flag, or otherwise Babel.

To run the activity example:
```shell
$ node examples/activity.js
```

## Emojis
You can use Emojis in your output. Yurnalist should disable them if they are not allowed in the application environment.

[node-emoji](https://github.com/omnidan/node-emoji)
[Cheat sheet](https://www.webpagefx.com/tools/emoji-cheat-sheet/)
