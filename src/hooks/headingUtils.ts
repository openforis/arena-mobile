import { Numbers } from "@openforis/arena-core";

// Low-pass filter factor: higher = more responsive, lower = smoother
export const EMA_ALPHA = 0.25;

// Minimum interval between heading state updates (re-renders)
export const HEADING_UPDATE_INTERVAL_MS = 150;

// Smaller changes (degrees) of the displayed heading are ignored
export const HEADING_MIN_CHANGE = 1;

// Signed difference in [-180, 180) handling 0/360 wrap-around
const wrappedDiff = (prev: number, next: number): number =>
  ((((next - prev) % 360) + 540) % 360) - 180;

// Circular EMA that handles 0/360 wrap-around
export const circularEma = (
  prev: number,
  next: number,
  alpha: number,
): number => Numbers.absMod(360)(prev + alpha * wrappedDiff(prev, next));

// Heading to display (whole degrees), or null if it changed less than HEADING_MIN_CHANGE
export const nextDisplayedHeading = (
  displayed: number | null,
  filtered: number,
): number | null => {
  if (
    displayed !== null &&
    Math.abs(wrappedDiff(displayed, filtered)) < HEADING_MIN_CHANGE
  ) {
    return null;
  }
  return Math.round(filtered) % 360;
};

export type HeadingSource = "magnetometer" | "location";
