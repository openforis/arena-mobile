// import DmsCoordinates from "dms-conversion";

import { AMConstants } from "./AMConstants";
import { Environment } from "./Environment";

let Exify;
if (!Environment.isExpoGo) {
  Exify = require("@lodev09/react-native-exify");
}

// const convertLatLonToDms = (latitude, longitude) => {
//   const dmsCoords = new DmsCoordinates(latitude, longitude);
//   return {
//     latitude: dmsCoords.latitude.toString(),
//     longitude: dmsCoords.longitude.toString(),
//   };
// };

const readData = async ({ fileUri }) => Exify?.readAsync(fileUri);

const writeData = async ({ fileUri, data }) => Exify?.writeAsync(fileUri, data);

const writeGpsData = async ({ fileUri, location }) => {
  const { coords, timestamp } = location;
  const { latitude, longitude, altitude } = coords;
  const locationTimestampObj = new Date(timestamp);

  const existingTags = (await readData({ fileUri })) ?? {};

  const newTags = {
    // GPS Tags
    GPSLatitude: latitude,
    GPSLatitudeRef: latitude >= 0 ? "N" : "S",
    GPSLongitude: longitude,
    GPSLongitudeRef: longitude >= 0 ? "E" : "W",
    GPSAltitude: altitude,
    GPSAltitudeRef: altitude < 0 ? 1 : 0, // 0 for above sea, 1 for below
    // GPSTimeStamp: [hours, minutes, seconds] UTC
    GPSTimeStamp: [
      locationTimestampObj.getUTCHours(),
      locationTimestampObj.getUTCMinutes(),
      locationTimestampObj.getUTCSeconds(),
    ],
    // GPSDateStamp: "YYYY:MM:DD" UTC
    GPSDateStamp: locationTimestampObj
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, ":"),

    UserComment: `Geotagged from ${AMConstants.appName} app`,
    Make: AMConstants.appNameCompact,
  };
  await writeData({ fileUri, data: { ...existingTags, ...newTags } });
};

const copyData = async ({ sourceFileUri, targetFileUri }) => {
  const data = await ExifUtils.readData({ fileUri: sourceFileUri });
  if (data) {
    try {
      await ExifUtils.writeData({ fileUri: targetFileUri, data });
    } catch (_error) {
      return false;
    }
  }
  return true;
};

export const ExifUtils = {
  readData,
  writeData,
  writeGpsData,
  copyData,
};
