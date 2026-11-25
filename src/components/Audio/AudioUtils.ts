export const formatRecordingDuration = (
  durationMillis: number | null | undefined,
  defaultValue: string | null = "00:00",
): string | null => {
  if (
    durationMillis == null ||
    Number.isNaN(durationMillis) ||
    durationMillis < 0
  )
    return defaultValue;

  const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
  const seconds = totalSeconds % 60;
  const minutesTotal = Math.floor(totalSeconds / 60);
  const minutes = minutesTotal % 60;
  const hours = Math.floor(minutesTotal / 60);

  const secondsStr = String(seconds).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");

  const parts = [];
  if (hours > 0) {
    parts.push(String(hours));
  }
  parts.push(minutesStr, secondsStr);

  return parts.join(":");
};
