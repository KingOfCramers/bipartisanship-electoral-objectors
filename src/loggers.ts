export const logWarning = (err: Error): void => {
  console.error(`⚠️`, err.stack);
};

export const logError = (err: Error): void => {
  console.error(`❌`, err.stack);
};
