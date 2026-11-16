import { detectMapFileType } from "./fileType";

describe("detectMapFileType", () => {
  it.each([
    [[0x25, 0x50, 0x44, 0x46, 0x2d], "pdf"],
    [[0x49, 0x49, 0x2a, 0x00], "geotiff"],
    [[0x4d, 0x4d, 0x00, 0x2a], "geotiff"],
    [[0x49, 0x49, 0x2b, 0x00], "geotiff"],
    [[0xff, 0xd8, 0xff, 0xe0], null],
    [[0x25], null],
  ])("detects %j as %s", (bytes, expected) => {
    expect(detectMapFileType(Uint8Array.from(bytes))).toBe(expected);
  });
});
