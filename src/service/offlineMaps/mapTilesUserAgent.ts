import * as Application from "expo-application";

// identifies the app to the tile servers (same product token set by the httpUserAgent plugin)
export const mapTilesUserAgent = `OpenForisArenaMobile/${Application.nativeApplicationVersion ?? "2"} (+https://www.openforis.org)`;
