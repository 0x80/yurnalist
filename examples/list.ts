import report from "../dist";

const someList = ["bananas", "tulips", "eggs", "bamischijf"];

report.list("My grocery list", someList);

const hints = {
  bananas: "for baking",
  tulips: "because it makes you happy",
  eggs: "not the cheap ones though",
  bamischijf: "if they have it",
};

report.list("The same list with hints", someList, hints);
