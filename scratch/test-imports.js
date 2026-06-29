const { Annotation } = require("@langchain/langgraph");

console.log("Annotation keys:", Object.keys(Annotation));
console.log("Annotation type:", typeof Annotation);
try {
  const annotation = Annotation.Root({
    test: Annotation()
  });
  console.log("Root call worked!", Object.keys(annotation));
} catch(e) {
  console.log("Root call failed:", e.message);
}
