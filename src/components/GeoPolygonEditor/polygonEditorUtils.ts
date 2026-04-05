import { LatLng } from "model";

export type MapPolygonExtendedProps = {
  key: string;
  coordinates: LatLng[];
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
};

const polygonColorPalette = [
  ["#1e88e5", "rgba(30, 136, 229, 0.25)"],
  ["#00897b", "rgba(0, 137, 123, 0.25)"],
  ["#f57c00", "rgba(245, 124, 0, 0.25)"],
  ["#6d4c41", "rgba(109, 76, 65, 0.25)"],
  ["#8e24aa", "rgba(142, 36, 170, 0.25)"],
] as const;

export const getRandomPolygonColors = (): [string, string] => {
  const index = Math.floor(Math.random() * polygonColorPalette.length);
  const colors = polygonColorPalette[index] ?? polygonColorPalette[0];
  return [colors[0], colors[1]];
};
