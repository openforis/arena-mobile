import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import { fixupPluginRules } from "@eslint/compat";

export default [
  {
    ...js.configs.recommended,
    files: ["**/*.js", "**/*.mjs", "**/*.jsx"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": fixupPluginRules(reactHooksPlugin),
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: { version: "19" },
      "import/resolver": {
        node: {
          paths: ["src"],
        },
      },
    },
  },
];
