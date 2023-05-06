import report from "../dist/index.js";
/* eslint-env node */

function doSomeWork(secs = 1) {
  return new Promise((resolve) => setTimeout(resolve, secs * 1000));
}

async function fetchSomething() {
  report.info("Wait while I fetch something for you");
  report.warn("It might take a little while though");

  const spinner = report.activity();
  spinner.tick("I am on it");

  try {
    await doSomeWork();
    spinner.tick("Still busy");
    await doSomeWork();
    spinner.tick("Almost there");
    await doSomeWork();
    report.success("Done!");
  } catch (err) {
    report.error(err);
  }

  spinner.end();
}

fetchSomething();
