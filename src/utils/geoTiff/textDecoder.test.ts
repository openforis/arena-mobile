import { TextDecoderFallback } from "./textDecoder";

describe("TextDecoderFallback", () => {
  it("decodes ASCII and UTF-8 text like TextDecoder", () => {
    const text = "WGS 84 / UTM zone 33N|Réseau géodésique|";
    const bytes = new TextEncoder().encode(text);
    expect(new TextDecoderFallback().decode(bytes)).toBe(text);
    expect(new TextDecoderFallback().decode(bytes.buffer)).toBe(text);
  });
});
