import { AppPlatforms } from "./AppPlatforms";

describe("AppPlatforms.fromPlatformOS", () => {
  test.each([
    ["android", "android"],
    ["ios", "ios"],
    ["web", "ios"],
    ["windows", "ios"],
  ])("maps %s to %s", (platformOS, expected) => {
    expect(AppPlatforms.fromPlatformOS(platformOS)).toBe(expected);
  });
});
