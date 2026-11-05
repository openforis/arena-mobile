# Map app chooser and in-app location viewer

Goal: in the coordinate attribute, the "open map" button lets the user pick the map app
(external installed apps) or view the point inside Arena Mobile (works offline with
downloaded offline map areas).

## Design
- Every tap on the map button opens a chooser (no stored default, no hidden gestures).
  The last-used app is listed first.
- Chooser entries: "View in Arena Mobile" + installed external map apps.
- `react-native-map-link` is wrapped in `src/service/mapApps/`; only `mapAppsAdapter.ts`
  imports it, so the library can be replaced by updating one file.

## Steps
1. Install `react-native-map-link`; import it in the adapter only (ESLint does not lint TS files in this repo, so no rule).
2. Config plugin `plugins/mapAppsQueries.js`, fed by `supportedMapApps.json` (iOS `LSApplicationQueriesSchemes`,
   Android `<queries>`), fed by the supported apps list. Requires a prebuild.
3. `src/service/mapApps/`: `mapAppsAdapter.ts` (library wrapper, own `MapApp` type),
   `mapAppsService.ts` (targets, last-used ordering), `index.ts`, Jest tests.
4. In-app viewer screen `LocationMapViewer` (marker + "my location" button, uses `MapView`
   so layer settings and offline tiles apply).
5. Chooser dialog and `OpenMapButton` rework (covers coordinate attribute and ImagePreviewDialog).
6. English localization.
7. Verify: `yarn lint`, `yarn test:types`, `yarn test`; manual tests on Android/iOS
   (apps installed or not, airplane mode with a downloaded area).

## Later
"Remember my choice" checkbox, Settings entry to change/reset it, first-time toast.
