import { UserManual } from "./UserManual";

const releasesUrl = "https://github.com/openforis/arena-mobile/releases";

describe("UserManual.getUrl", () => {
  it.each(["en", "fr", "es"])(
    "returns the manual in %s of the app version",
    (lang) => {
      expect(UserManual.getUrl({ lang, version: "2.12.0" })).toBe(
        `${releasesUrl}/download/v2.12.0/arena-mobile-user-manual-${lang}.pdf`,
      );
    },
  );

  it("ignores the region of the language", () => {
    expect(UserManual.getUrl({ lang: "fr-CA", version: "2.12.0" })).toBe(
      `${releasesUrl}/download/v2.12.0/arena-mobile-user-manual-fr.pdf`,
    );
  });

  it.each(["pt", "ru", undefined, null, ""])(
    "falls back to English for %p",
    (lang) => {
      expect(UserManual.getUrl({ lang, version: "2.12.0" })).toBe(
        `${releasesUrl}/download/v2.12.0/arena-mobile-user-manual-en.pdf`,
      );
    },
  );

  it.each([undefined, null, ""])(
    "returns the manual of the latest release without version (%p)",
    (version) => {
      expect(UserManual.getUrl({ lang: "es", version })).toBe(
        `${releasesUrl}/latest/download/arena-mobile-user-manual-es.pdf`,
      );
    },
  );
});
