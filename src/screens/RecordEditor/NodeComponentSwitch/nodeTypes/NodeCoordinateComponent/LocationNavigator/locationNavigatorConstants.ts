export const PROXIMITY_THRESHOLD_METRES = 30;

export const NAV_COLOR_GREEN = "#4caf50";
export const NAV_COLOR_ORANGE = "#ff9800";
export const NAV_COLOR_RED = "#f44336";
const NAV_TEXT_ON_COLOR = "#fff";

export const cardStyleGreen = { backgroundColor: NAV_COLOR_GREEN, textColor: NAV_TEXT_ON_COLOR };
export const cardStyleOrange = { backgroundColor: NAV_COLOR_ORANGE, textColor: NAV_TEXT_ON_COLOR };
export const cardStyleRed = { backgroundColor: NAV_COLOR_RED, textColor: NAV_TEXT_ON_COLOR };

type NavLevel = "green" | "orange" | "red";

const NAV_LEVEL_COLORS: Record<NavLevel, string> = {
  green: NAV_COLOR_GREEN,
  orange: NAV_COLOR_ORANGE,
  red: NAV_COLOR_RED,
};

const NAV_LEVEL_CARD_STYLES: Record<NavLevel, typeof cardStyleGreen> = {
  green: cardStyleGreen,
  orange: cardStyleOrange,
  red: cardStyleRed,
};

export const getRelativeAngleLevel = (relativeAngle: number): NavLevel => {
  if (relativeAngle <= 20 || relativeAngle >= 340) return "green";
  if (relativeAngle <= 45 || relativeAngle >= 315) return "orange";
  return "red";
};

export const getRelativeAngleColor = (relativeAngle: number): string =>
  NAV_LEVEL_COLORS[getRelativeAngleLevel(relativeAngle)];

export const getRelativeAngleCardStyle = (
  relativeAngle: number | null,
): typeof cardStyleGreen | null => {
  if (relativeAngle == null) return null;
  return NAV_LEVEL_CARD_STYLES[getRelativeAngleLevel(relativeAngle)];
};

export const getAccuracyCardStyle = (
  accuracy: number | null | undefined,
  threshold: number,
): typeof cardStyleGreen | null => {
  if (accuracy == null || !Number.isFinite(accuracy)) return null;
  if (accuracy <= threshold) return cardStyleGreen;
  if (accuracy <= threshold * 2) return cardStyleOrange;
  return cardStyleRed;
};
