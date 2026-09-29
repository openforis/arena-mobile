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
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    // .babelrc doesn't apply to node_modules, so pass the preset explicitly
    [`/node_modules/(${esModules})/.+\\.m?js$`]: [
      "babel-jest",
      { presets: ["babel-preset-expo"] },
    ],
    "\\.[jt]sx?$": "babel-jest",
  },
  transformIgnorePatterns: [`/node_modules/(?!(${esModules})/)`],
};
