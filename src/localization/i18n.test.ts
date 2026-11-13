const mockFetchSettings = jest.fn();

jest.mock("service/settingsService", () => ({
  SettingsService: { fetchSettings: () => mockFetchSettings() },
}));
jest.mock("utils/SystemUtils", () => ({
  SystemUtils: { getLanguageCode: () => "es" },
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const loadI18n = async ({ language }: { language: string }) => {
  mockFetchSettings.mockResolvedValue({ language });
  let mod: typeof import("./i18n") | undefined;
  jest.isolateModules(() => {
    mod = require("./i18n");
  });
  await flushPromises();
  return mod!;
};

describe("i18n", () => {
  test("only the fallback and the language in settings are loaded at startup", async () => {
    const { i18n } = await loadI18n({ language: "fr" });
    expect(i18n.language).toBe("fr");
    expect(i18n.hasResourceBundle("en", "common")).toBe(true);
    expect(i18n.hasResourceBundle("fr", "common")).toBe(true);
    expect(i18n.hasResourceBundle("de", "common")).toBe(false);
    expect(i18n.t("common:cancel")).toBe("Annuler");
  });

  test("system language is resolved and loaded", async () => {
    const { i18n } = await loadI18n({ language: "system" });
    expect(i18n.language).toBe("es");
    expect(i18n.hasResourceBundle("es", "common")).toBe(true);
  });

  test("a language is loaded when changed to", async () => {
    const { changeLanguage, i18n } = await loadI18n({ language: "en" });
    expect(i18n.hasResourceBundle("fr", "common")).toBe(false);
    changeLanguage("fr");
    await flushPromises();
    expect(i18n.language).toBe("fr");
    expect(i18n.t("common:cancel")).toBe("Annuler");
  });

  test("unsupported languages fall back to english", async () => {
    const { changeLanguage, i18n } = await loadI18n({ language: "en" });
    changeLanguage("xx");
    await flushPromises();
    expect(i18n.language).toBe("en");
    expect(i18n.t("common:cancel")).toBe("Cancel");
  });
});
