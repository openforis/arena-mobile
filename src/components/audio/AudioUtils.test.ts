import { formatRecordingDuration } from "./AudioUtils";

describe("AudioUtils", () => {
  describe("formatRecordingDuration", () => {
    it("returns 00:00 for zero duration", () => {
      expect(formatRecordingDuration(0)).toBe("00:00");
    });

    it("formats durations under one hour as mm:ss", () => {
      expect(formatRecordingDuration(65_000)).toBe("01:05");
      expect(formatRecordingDuration(3_599_000)).toBe("59:59");
    });

    it("formats durations of one hour or more as h:mm:ss", () => {
      expect(formatRecordingDuration(3_600_000)).toBe("1:00:00");
      expect(formatRecordingDuration(3_661_000)).toBe("1:01:01");
    });

    it("clamps negative values to 00:00", () => {
      expect(formatRecordingDuration(-1_000)).toBe("00:00");
    });
  });
});
