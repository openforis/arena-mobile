import { FileSizes } from "./FileSizes";

const { toHumanReadableFileSize } = FileSizes;

describe("FileSizes.toHumanReadableFileSize", () => {
  test("values below 1024 are shown in bytes", () => {
    expect(toHumanReadableFileSize(0)).toBe("0 B");
    expect(toHumanReadableFileSize(1023)).toBe("1023 B");
    expect(toHumanReadableFileSize(-1023)).toBe("-1023 B");
  });

  test("converts to the right unit at boundaries", () => {
    expect(toHumanReadableFileSize(1024)).toBe("1.0 kB");
    expect(toHumanReadableFileSize(1536)).toBe("1.5 kB");
    expect(toHumanReadableFileSize(1024 ** 2)).toBe("1.0 MB");
    expect(toHumanReadableFileSize(1024 ** 3)).toBe("1.0 GB");
    expect(toHumanReadableFileSize(-2048)).toBe("-2.0 kB");
  });

  test("moves to next unit when rounding reaches 1024", () => {
    // 1023.999 kB would display as 1024.0 kB
    expect(toHumanReadableFileSize(1024 ** 2 - 1)).toBe("1.0 MB");
    expect(toHumanReadableFileSize(1024 ** 2 - 1, { decimalPlaces: 3 })).toBe(
      "1023.999 kB",
    );
  });

  test("supports custom decimal places", () => {
    expect(toHumanReadableFileSize(1536, { decimalPlaces: 0 })).toBe("2 kB");
    expect(toHumanReadableFileSize(1234567, { decimalPlaces: 2 })).toBe(
      "1.18 MB",
    );
  });

  test("caps at the largest unit", () => {
    expect(toHumanReadableFileSize(1024 ** 9)).toBe("1024.0 YB");
  });
});
