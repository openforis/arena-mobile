import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import { fixupPluginRules } from "@eslint/compat";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

// React Compiler rules: reported as warnings until the existing code is adapted
const reactCompilerRules = [
  "globals",
  "immutability",
  "preserve-manual-memoization",
  "purity",
  "refs",
  "set-state-in-effect",
  "set-state-in-render",
  "static-components",
  "use-memo",
];

export default [
  // bundled Yarn release (--fix would rewrite it) and build output
  {
    ignores: [
      ".yarn/",
      ".expo/",
      "android/",
      "ios/",
      "dist/",
      "dist-web/",
      "web-build/",
      "modules/*/android/",
      "coverage/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,jsx,ts,tsx}"],
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
      ...Object.fromEntries(
        reactCompilerRules.map((rule) => [`react-hooks/${rule}`, "warn"]),
      ),
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      // require() is how React Native loads static assets
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrors: "none",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_",
        },
      ],
    },
    settings: {
      react: { version: "19" },
    },
  },
  {
    // config files and Expo config plugins run in Node
    files: ["*.{js,mjs,ts}", "jest/**", "plugins/**", "e2e/**/*.js"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/*.test.{ts,tsx}", "jest/**"],
    languageOptions: { globals: globals.jest },
  },
  // turns off the rules that conflict with Prettier
  prettierConfig,
];
