import { Numbers } from "@openforis/arena-core";

// Low-pass filter factor: higher = more responsive, lower = smoother
export const EMA_ALPHA = 0.25;

// Circular EMA that handles 0/360 wrap-around
export const circularEma = (prev: number, next: number, alpha: number): number => {
  const diff = next - prev;
  const wrappedDiff = (((diff % 360) + 540) % 360) - 180;
  return Numbers.absMod(360)(prev + alpha * wrappedDiff);
};

export type HeadingSource = "magnetometer" | "location";
