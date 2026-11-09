import { UserManual } from "./UserManual";

const urlPrefix =
  "https://github.com/openforis/arena-mobile/releases/latest/download/arena-mobile-user-manual";

describe("UserManual.getUrl", () => {
  it.each(["en", "fr", "es"])("returns the manual in %s", (lang) => {
    expect(UserManual.getUrl(lang)).toBe(`${urlPrefix}-${lang}.pdf`);
  });

  it("ignores the region of the language", () => {
    expect(UserManual.getUrl("fr-CA")).toBe(`${urlPrefix}-fr.pdf`);
  });

  it.each(["pt", "ru", undefined, null, ""])(
    "falls back to English for %p",
    (lang) => {
      expect(UserManual.getUrl(lang)).toBe(`${urlPrefix}-en.pdf`);
    },
  );
});
