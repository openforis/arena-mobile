# geo-intent

Local Expo module (autolinked from `modules/`, Android only) to view `geo:` URIs
in a specific app (by package name) or through the system app chooser. Used by
`src/service/mapApps` (JS interface: `src/service/mapApps/GeoIntent.ts`) for
map apps that `react-native-map-link` cannot tell apart (MAPS.ME and Organic
Maps both register the `mapsme://` scheme).

Native code changes require a new native build (`yarn prebuild:android`,
`eas build`); the module is not available in Expo Go.
