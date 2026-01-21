window.addEventListener("load", () => {
  performance
    .getEntriesByType("resource")
    .filter((entry) => entry.initiatorType === "img")
    .forEach(({ name, duration }) => {
      console.log(`The image at this URL: ${name} took ${duration}ms to load`);
    });
});
