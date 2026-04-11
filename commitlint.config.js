export default {
  parserPreset: {
    parserOpts: {
      headerPattern: /^([^:]+):\s(.+)$/,
      headerCorrespondence: ["type", "subject"],
    },
  },
  rules: {
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "type-case": [0],
    "subject-case": [0],
    "body-max-line-length": [2, "always", 100],
  },
};
