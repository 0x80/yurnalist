import report from "../dist/index.js";

const anArray = ["some", "values", () => "hello", 3654, true];
const anObject = {
  string: "value",
  fun: (a, b) => a + b,
  number: 42,
  symbol: Symbol("some symbol"),
  boolean: true,
  array: anArray,
};

// @ts-expect-error not in type
anObject.nestedObject = Object.assign({}, anObject);

report.inspect(anObject);
