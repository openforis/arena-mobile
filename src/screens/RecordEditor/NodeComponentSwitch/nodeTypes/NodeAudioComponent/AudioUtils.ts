export const formatRecordingDuration = (
  durationMillis: number,
): string | null => {
  if (!Number.isFinite(durationMillis) || durationMillis < 0) {
    return null;
  }
  const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
  const seconds = totalSeconds % 60;
  const minutesTotal = Math.floor(totalSeconds / 60);
  const minutes = minutesTotal % 60;
  const hours = Math.floor(minutesTotal / 60);

  const secondsStr = String(seconds).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${minutesStr}:${secondsStr}`;
  }

  return `${minutesStr}:${secondsStr}`;
};
