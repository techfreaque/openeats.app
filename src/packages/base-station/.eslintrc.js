module.exports = {
  extends: ["../../.eslintrc.js"],
  rules: {
    "spellcheck/spell-checker": [
      "warn",
      {
        skipWords: [
          "aplay",
          "amixer",
          "retryable",
          "Retryable",
          "capabilitymin",
          "promiseconfig",
          "timeoutetryable",
          "Infinityf",
          "retryable"
        ]
      }
    ]
  }
};
