module.exports = {
    collectCoverage: true,
    collectCoverageFrom: [
      "controllers/**/**/*.js",
      "!**/__tests__/**",
      "!node_modules/**",
      "!**/index.js",
      "!report",
      "!coverage",
      "!test/**"
    ],
    testMatch: [
      "<rootDir>/__tests__/**",
      "!<rootDir>/__tests__/server.test.js",
      "!node_modules/**",
    ],
    reporters: [
      "default",
      [
        "jest-stare",
        {
          resultDir: "report/jest-stare",
          reportTitle: "jest-stare!",
          additionalResultsProcessors: ["jest-junit"],
          coverageLink: "../../coverage/lcov-report/index.html",
          jestStareConfigJson: "jest-stare.json",
          jestGlobalConfigJson: "globalStuff.json",
        },
      ],
    ],
  };
  