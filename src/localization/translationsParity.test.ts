import fs from "node:fs";
import path from "node:path";

import { Languages } from "model/LanguageSettings";

type Texts = Record<string, string>;

jest.mock("service/settings/settingsService", () => ({
  SettingsService: { fetchSettings: () => Promise.resolve({}) },
}));
jest.mock("utils/SystemUtils", () => ({
  SystemUtils: { getLanguageCode: () => "en" },
}));

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

const flatten = (obj: object, prefix = ""): Texts =>
  Object.entries(obj).reduce((acc: Texts, [key, value]) => {
    const keyPath = `${prefix}${key}`;
    if (value && typeof value === "object") {
      Object.assign(acc, flatten(value, `${keyPath}.`));
    } else {
      acc[keyPath] = String(value);
    }
    return acc;
  }, {});

const loadTexts = (lang: string): Texts =>
  flatten(require(`./${lang}`).default);

const baseKeys = (texts: Texts): string[] =>
  [
    ...new Set(Object.keys(texts).map((key) => key.replace(PLURAL_SUFFIX, ""))),
  ].sort();

// {{placeholders}} and $t(...) references of the texts of a key (all plural forms together)
const tokensByBaseKey = (texts: Texts): Record<string, string> => {
  const tokens: Record<string, Set<string>> = {};
  for (const [key, text] of Object.entries(texts)) {
    const baseKey = key.replace(PLURAL_SUFFIX, "");
    const matches = text.match(/{{\s*\w+\s*}}|\$t\([^)]+\)/g) ?? [];
    tokens[baseKey] = new Set([
      ...(tokens[baseKey] ?? []),
      ...matches.map((m) => m.replace(/\s/g, "")),
    ]);
  }
  return Object.fromEntries(
    Object.entries(tokens).map(([key, set]) => [key, [...set].sort().join()]),
  );
};

const localizationDir = __dirname;
const languageFolders = fs
  .readdirSync(localizationDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const enTexts = loadTexts("en");
const enBaseKeys = baseKeys(enTexts);
const enTokens = tokensByBaseKey(enTexts);
const otherLanguages = languageFolders.filter((lang) => lang !== "en");

describe("translations", () => {
  test("every language folder is loadable and selectable in settings", () => {
    const { supportedLngs } = require("./i18n");
    expect([...supportedLngs].sort()).toEqual(languageFolders);
    expect(Languages.map(({ key }) => key).sort()).toEqual(languageFolders);
  });

  test.each(otherLanguages)("%s has the same namespaces as en", (lang) => {
    const namespaces = (lng: string) =>
      fs
        .readdirSync(path.join(localizationDir, lng))
        .filter((file) => file !== "index.ts")
        .sort();
    expect(namespaces(lang)).toEqual(namespaces("en"));
  });

  test.each(otherLanguages)("%s has the keys of en", (lang) => {
    expect(baseKeys(loadTexts(lang))).toEqual(enBaseKeys);
  });

  test.each(otherLanguages)(
    "%s keeps the placeholders and references of en",
    (lang) => {
      const tokens = tokensByBaseKey(loadTexts(lang));
      const mismatches = Object.keys(tokens).filter(
        (key) => tokens[key] !== enTokens[key],
      );
      expect(mismatches).toEqual([]);
    },
  );
});
