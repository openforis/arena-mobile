// Fixed values for the `preferredGpsSourceId` setting. A recognized external GPS
// device is identified by a dynamic `external:${deviceAddress}` string (see
// service/externalGps), which can't be enumerated here since it depends on what's
// currently bonded.
export enum GpsSourceSetting {
  auto = "auto",
  internal = "internal",
}
