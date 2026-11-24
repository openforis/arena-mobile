const keys = {
  UNKNOWN: 0,
  PORTRAIT_UP: 1,
  PORTRAIT_DOWN: 2,
  LANDSCAPE_LEFT: 3,
  LANDSCAPE_RIGHT: 4,
};

const isLandscapeByKey: Record<number, boolean> = {
  [keys.LANDSCAPE_LEFT]: true,
  [keys.LANDSCAPE_RIGHT]: true,
};

const isLandscape = (orientation: number | null | undefined): boolean =>
  orientation != null && !!isLandscapeByKey[orientation];
const fromExpoOrientation = (
  expoOrientation: number | null | undefined,
): number | null =>
  expoOrientation != null && Object.values(keys).includes(expoOrientation)
    ? expoOrientation
    : null;

export const ScreenOrientation = {
  keys,
  fromExpoOrientation,
  isLandscape,
};
