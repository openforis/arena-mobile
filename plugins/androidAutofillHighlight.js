const { AndroidConfig, withAndroidStyles } = require("@expo/config-plugins");

// Android draws the autofill highlight ignoring the input horizontal scroll (misplaced on RN Paper inputs): hide it
module.exports = function androidAutofillHighlightPlugin(config) {
  return withAndroidStyles(config, (config) => {
    config.modResults = AndroidConfig.Styles.assignStylesValue(
      config.modResults,
      {
        add: true,
        parent: AndroidConfig.Styles.getAppThemeGroup(),
        name: "android:autofilledHighlight",
        value: "@android:color/transparent",
      },
    );
    return config;
  });
};
