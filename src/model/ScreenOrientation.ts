const keys = {
  UNKNOWN: 0,
  PORTRAIT_UP: 1,
  PORTRAIT_DOWN: 2,
  LANDCAPE_LEFT: 3,
  LANDSCAPE_RIGHT: 4,
};

const isPortraitByKey = {
  [keys.PORTRAIT_DOWN]: true,
  [keys.PORTRAIT_UP]: true,
};

const isLandscapeByKey = {
  [keys.LANDCAPE_LEFT]: true,
  [keys.LANDSCAPE_RIGHT]: true,
};

const isPortrait = (orientation) => !!isPortraitByKey[orientation];
const isLandscape = (orientation) => !!isLandscapeByKey[orientation];
const fromExpoOrientation = (expoOrientation) =>
  Object.values(keys).includes(expoOrientation) ? expoOrientation : null;

export const ScreenOrientation = {
  keys,
  fromExpoOrientation,
  isPortrait,
  isLandscape,
};
