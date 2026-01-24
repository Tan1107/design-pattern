const myModule = (() => {
  const privateVar = "I AM PRIVATE!!!";
  const privateMethod = () => "I AM A PRIVATE METHOD";

  return {
    publicVar: "I AM PUBLIC!!!",
    publicMethod: () => {
      console.log("calling private method: ", privateMethod());
    },
  };
})();

const counter = (() => {
  let count = 1;
  return {
    getCount: () => count,
    increment: () => count++,
  };
})();
