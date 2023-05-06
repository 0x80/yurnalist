import report from "../dist/index.js";

async function askQuestions() {
  let answer = await report.question("What do you want?");
  report.info(`Sorry, I don't have ${answer}`);

  answer = await report.question(`What's your password? (required)`, {
    password: true,
    required: true,
  });

  report.info(`Thanks, I won't tell anyone`);
}

askQuestions();
