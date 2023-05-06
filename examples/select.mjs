import report from "../dist/index.js";

async function chooseLife() {
  const answer = await report.select("What do you choose?", "Your choice", [
    {
      name: "The blue pill",
      value: "blue",
    },
    {
      name: "The red pill",
      value: "red",
    },
  ]);

  switch (answer) {
    case "blue":
      report.success(
        "You choose knowledge, freedom and the sometimes painful truth of reality"
      );
      break;
    case "red":
      report.success(
        "You choose falsehood, security and the blissful ignorance of illusion"
      );
      break;
  }
}

chooseLife();
