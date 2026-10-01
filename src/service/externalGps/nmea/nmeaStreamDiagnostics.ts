import { LocationPoint } from "model";

const rawSamplesLimit = 5;
const rawSampleMaxLength = 120;

// e.g. "$GPGGA,..." -> "GPGGA"; proprietary sentences like "$PELFID,..." -> "PELFID"
const sentenceIdRegExp = /^\$([A-Z]{3,8}),/;

/**
 * Collects counters about the raw stream of an external GPS receiver (how many
 * chunks arrived, which NMEA sentences, how many produced a position, the last GGA's
 * fix status) so that "the coordinate stays empty" reports can be diagnosed from the
 * app log alone: no data at all, data but no satellite fix, or unparseable data.
 */
export const createNmeaStreamDiagnostics = () => {
  let chunksCount = 0;
  let locationPointsCount = 0;
  let unrecognizedChunksCount = 0;
  let lastGgaStatus: string | null = null;
  let lastAccuracy: number | null | undefined = null;
  const countBySentenceId: Record<string, number> = {};

  /**
   * Records a received chunk and returns a printable sample of it for the first
   * `rawSamplesLimit` chunks (null afterwards), so the log shows what the receiver
   * actually sends without being flooded for the whole watch.
   */
  const record = (
    chunk: string,
    locationPoint: LocationPoint | null,
  ): string | null => {
    chunksCount += 1;

    const sentence = chunk.slice(Math.max(chunk.lastIndexOf("$"), 0)).trim();
    const sentenceId = sentenceIdRegExp.exec(sentence)?.[1];
    if (sentenceId) {
      countBySentenceId[sentenceId] = (countBySentenceId[sentenceId] ?? 0) + 1;
      if (sentenceId.endsWith("GGA")) {
        const fields = sentence.split(",");
        lastGgaStatus = `fixQuality=${fields[6] || "?"} satellites=${fields[7] || "?"} hdop=${fields[8] || "?"}`;
      }
    } else {
      unrecognizedChunksCount += 1;
    }

    if (locationPoint) {
      locationPointsCount += 1;
      lastAccuracy = locationPoint.accuracy;
    }

    if (chunksCount > rawSamplesLimit) return null;
    // JSON.stringify escapes control/binary characters so they are visible in the log
    return JSON.stringify(chunk.slice(0, rawSampleMaxLength));
  };

  const summary = (): string =>
    [
      `chunks=${chunksCount}`,
      `sentences=${JSON.stringify(countBySentenceId)}`,
      `unrecognized=${unrecognizedChunksCount}`,
      `positions=${locationPointsCount}`,
      `lastGGA=[${lastGgaStatus ?? "none"}]`,
      `lastAccuracy=${lastAccuracy ?? "none"}`,
    ].join(" ");

  return { record, summary };
};
