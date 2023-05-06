import report from "../dist/index.js";
/* eslint-env node */

function waitNumSecs(secs) {
  return new Promise((resolve) => setTimeout(resolve, secs * 1000));
}

async function waitForIt(steps) {
  let count = 0;
  const tick = report.progress(steps);

  report.info("🥚 Wait for it...");

  while (++count <= steps) {
    tick();
    await waitNumSecs(0.5);
  }
  report.success("🐣 Tjiep!");
}

waitForIt(8);
