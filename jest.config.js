// dependencies of @openforis/arena-core published as ES modules only
const esModules = [
  "@jsep-plugin/regex",
  "@turf/[^/]+",
  "change-case",
  "jsep",
  "n2words",
  "uuid",
  "wkt-parser",
].join("|");

module.exports = {
  testEnvironment: "node",
  modulePaths: ["<rootDir>/src"],
  moduleNameMapper: {
    [String.raw`\.(jpg|png)$`]: "<rootDir>/jest/fileStub.js",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    // .babelrc doesn't apply to node_modules, so pass the preset explicitly
    [String.raw`/node_modules/(${esModules})/.+\.m?js$`]: [
      "babel-jest",
      { presets: ["babel-preset-expo"] },
    ],
    [String.raw`\.[jt]sx?$`]: "babel-jest",
  },
  transformIgnorePatterns: [`/node_modules/(?!(${esModules})/)`],
};
