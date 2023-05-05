import report from "../dist";

function waitNumSecs(secs: number) {
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
