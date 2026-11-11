import { URLs } from "./URLs";

jest.mock("react-native", () => ({ Linking: {} }));

describe("URLs.toHttpUrlOrNull", () => {
  it.each([
    ["https://example.org/manual.pdf", "https://example.org/manual.pdf"],
    ["HTTP://example.org", "HTTP://example.org"],
    ["javascript:alert(1)", null],
    [" javascript:alert(1)", null],
    ["file:///data/db", null],
    ["example.org", null],
    ["", null],
    [undefined, null],
  ])("%s => %s", (url, expected) => {
    expect(URLs.toHttpUrlOrNull(url)).toBe(expected);
  });
});
