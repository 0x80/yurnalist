/* @noflow */
const report = require('../dist');
/* eslint-disable flowtype/require-return-type */

function doSomeWork(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForIt() {
  const spinner = report.activity();

  report.info('This is going to take a little while');

  const start = Date.now();
  const end = start + 5000;
  let now;

  do {
    now = Date.now();
    const msg = `${(now - start) / 1000} sec`;
    spinner.tick(msg);
    await doSomeWork(200);
  } while (now < end);

  spinner.end();
  report.success('Done!');
}

waitForIt();

report.close();
