import * as Location from "expo-location";

import { Objects } from "@openforis/arena-core";

import { AMConstants } from "./AMConstants";
import { Environment } from "./Environment";

let Exify: any;
if (!Environment.isExpoGo) {
  Exify = require("@lodev09/react-native-exify");
}

const readData = async ({ fileUri }: any) => Exify?.readAsync(fileUri);

const writeData = async ({ fileUri, data }: any) =>
  Exify?.writeAsync(fileUri, data);

const hasGpsData = async ({ fileUri }: any) => {
  const data = await readData({ fileUri });
  if (!data) {
    return false;
  }
  return (
    Objects.isNotEmpty(data.GPSLatitude) &&
    Number(data.GPSLatitude) !== 0 &&
    Objects.isNotEmpty(data.GPSLongitude) &&
    Number(data.GPSLongitude) !== 0
  );
};

const writeGpsData = async ({
  fileUri,
  location,
}: {
  fileUri: string;
  location: Location.LocationObject;
}) => {
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
    GPSAltitudeRef: (altitude ?? 0) < 0 ? 1 : 0, // 0 for above sea, 1 for below
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
      .replaceAll("-", ":"),

    UserComment: `Geotagged from ${AMConstants.appNameFull} app`,
    Make: AMConstants.appNameCompactInternal,
  };
  await writeData({ fileUri, data: { ...existingTags, ...newTags } });
};

const copyData = async ({ sourceFileUri, targetFileUri }: any) => {
  const data = await readData({ fileUri: sourceFileUri });
  if (!data) {
    return false;
  }
  await writeData({ fileUri: targetFileUri, data });
  return true;
};

export const ExifUtils = {
  readData,
  hasGpsData,
  writeData,
  writeGpsData,
  copyData,
};
