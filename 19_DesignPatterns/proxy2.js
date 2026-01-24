function multiply(a, b) {
  console.log(a * b);
}

function sum(a, b) {
  console.log(a + b);
}

const handler = {
  apply: function (targetFunc, thisArg, argsList) {
    console.log("YOU RAN THE FUNCTION!!!");
    console.log("args are:", argsList);
    targetFunc(...argsList);
  },
};

const multiplyProxy = new Proxy(multiply, handler);
const sumProxy = new Proxy(sum, handler);
