module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo",
      "@babel/preset-react",
      [
        "module:@react-native/babel-preset",
        { useTransformReactJSXExperimental: true },
      ],
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
        },
      ],
      "transform-remove-strict-mode",
    ],
    env: {
      production: {
        plugins: ["react-native-paper/babel"],
      },
    },
  };
};
