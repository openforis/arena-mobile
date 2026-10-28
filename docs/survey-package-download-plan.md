# Survey package download – implementation plan

Branch: `survey-package-download`

Companion plan (server): openforis/arena, branch `mobile-survey-package`,
`docs/superpowers/plans/2026-10-28-mobile-survey-package.md`.

## Goals

1. Download the survey from the server as a **zip package** instead of the
   bare survey JSON, so the **survey files** (preloaded map layers, branding
   images; later the survey area of interest) are available on the device,
   offline.
2. Store the package files next to the survey JSON, without changing the way
   the survey JSON itself is stored: **no migration** of the surveys already on
   the device.
3. Stay compatible with **older servers** (no package endpoint) and with the
   environments where unzipping is not available (Expo Go, web preview): there
   the app keeps downloading the survey JSON as today.

Showing the branding images and using the preloaded map layers / area of
interest are follow-ups: this plan only makes the files available.

## Package layout (produced by the server)

The package uses the same names and layout as the **Arena format export**
(dashboard → export survey), of which it is a subset:

```
info.json                 ArenaExportInfo (exportType "mobileSurvey")
survey.json               the survey (same object returned as `survey` by GET api/mobile/survey/:id)
surveyfiles/<uuid>.bin    content of the survey files referenced by the survey props
```

- There is no index of the files: as in the Arena export, the files are found
  from the survey props (`props.preloadedMapLayers`: list of survey files with
  uuid, name, size; `props.branding.<imageKey>.fileUuid`).
- `files/` is **not** used: in the Arena export it contains the record files,
  and the app already reads that layout when importing records.
- The only difference with the Arena export is the content of `survey.json`
  (merged props, one cycle, category items and taxa included in `refData`).
  Importing the survey part of a regular Arena export is a future step (single
  format).

Endpoint: `GET api/mobile/survey/:surveyRemoteId/package` (params: `cycle`,
`draft`, as the JSON endpoint). Older servers answer 404.

## Storage on the device

Current layout (unchanged):

```
survey_files/<localSurveyId>.json      survey JSON (with dependency graph)
SQLite table survey                    summary (name, label, remote id, dates); content always empty
```

New, only for surveys downloaded as package:

```
survey_files/<localSurveyId>/info.json
survey_files/<localSurveyId>/surveyfiles/<uuid>.bin
```

Why no migration is needed:

- the survey JSON stays at the same path, so the surveys already on the device
  are read exactly as today;
- the app has never stored survey files: there is nothing to move;
- "no package folder" is a normal state (surveys downloaded before, older
  servers, demo survey, Expo Go / web): the code that will use the files must
  treat a missing file as "not available";
- the files arrive with the next survey update from the server;
- records reference the survey by its local id, which does not change.

## Tasks

### Task 1: package layout and info (pure, unit tested)

`src/model/SurveyPackage.ts`:

```ts
// same names as the Arena format export (arena: server/modules/survey/service/surveyExport/exportFile.js)
const infoFileName = "info.json";
const surveyFileName = "survey.json";
const surveyFilesDirName = "surveyfiles";
const mobileSurveyExportType = "mobileSurvey";

const getSurveyFileEntryName = (fileUuid: string): string =>
  `${surveyFilesDirName}/${fileUuid}.bin`;

// true if the info is missing (lenient) or describes a mobile survey package
const isSupportedInfo = (info: unknown): boolean => { ... };

export const SurveyPackage = {
  infoFileName,
  surveyFileName,
  surveyFilesDirName,
  getSurveyFileEntryName,
  isSupportedInfo,
};
```

- [ ] `src/model/SurveyPackage.test.ts` (jest, like `MapLayers.test.ts`):
      entry names; info with `exportType: "mobileSurvey"` → supported; other
      export type (e.g. `"survey"`, a full Arena export) → not supported yet;
      missing info → supported.

### Task 2: storage of the package files (`SurveyFSRepository`)

`src/service/repository/surveyFSRepository.ts`:

- [ ] `getSurveyPackageDirUri({ surveyId })` → `${getSurveyFilesDirUri()}/${surveyId}`.
- [ ] `replaceSurveyPackageFiles({ surveyId, unzippedDirUri })`: deletes the
      current package folder (if any) and moves `info.json` and `surveyfiles/`
      from the unzipped folder into it (`Files.moveFile`, which works for
      folders: `FileSystem.moveAsync`). Called only after the survey JSON has
      been stored successfully, so a failed download never leaves the survey
      without its previous files.
- [ ] `deleteSurveyPackageFiles({ surveyId })`: deletes the package folder
      (`Files.del(uri, true)`, idempotent).
- [ ] `getSurveyPackageFileUri({ surveyId, fileUuid })` →
      `${getSurveyPackageDirUri({ surveyId })}/${SurveyPackage.getSurveyFileEntryName(fileUuid)}`,
      and `existsSurveyPackageFile({ surveyId, fileUuid })`, for the follow-ups.
- [ ] `deleteSurveyFile` (survey deletion) also deletes the package folder.
- [ ] `getStorageSize` already sums the folder recursively
      (`Files.getDirSize` → `visitDirFilesRecursively`): check that sub
      folders are included.

### Task 3: download (`SurveyService`)

`src/service/surveyService.ts`:

- [ ] `Files.isUnzipSupported()` in `src/utils/Files.ts`: `!!unzip` (false in
      Expo Go and on web).
- [ ] `fetchSurveyPackageRemote({ id })`:
  1. if unzip is not supported → `null`;
  2. `RemoteService.getFile(\`api/mobile/survey/${id}/package\`)` (authenticated
     download to a local file, same as the records export download in
     `recordRemoteService.ts`); a 404 / 501 (older server) → `null`, other
     errors are thrown as today;
  3. unzip into `Files.createTempFolder()`;
  4. read `info.json` (if present) and check `SurveyPackage.isSupportedInfo`
     (not supported → error, the server is newer than the app: same handling
     as the app version check), then read `survey.json`
     (`Files.readJsonFromFile`);
  5. return `{ survey, unzippedDirUri }`; the downloaded zip is deleted.
- [ ] `fetchSurveyRemote({ id })`: package if available, otherwise
      `fetchSurveyRemoteById` (current JSON endpoint) → `{ survey, unzippedDirUri: null }`.
- [ ] `importSurveyRemote` / `updateSurveyRemote`: use `fetchSurveyRemote`,
      store the survey as today (`_insertSurvey` / `_updateSurvey`), then, if a
      package was downloaded, `replaceSurveyPackageFiles` with the local survey
      id; always delete the temp folder (`finally`).
- [ ] When a survey is updated from the JSON endpoint (older server), delete
      its package folder, so the files never belong to a different survey
      version.
- [ ] `deleteSurveys`: also deletes the package folders (Task 2).

### Task 4: checks

- [ ] `yarn test`, `yarn test:types`, `yarn lint:check`.
- [ ] Manual test on a device / emulator (development build, not Expo Go):
  - new server: import a survey with branding images and preloaded map layers
    → `survey_files/<id>/surveyfiles/` contains the files; survey usable
    offline;
  - update the survey (after publishing a change) → files replaced;
  - delete the survey → package folder deleted; storage size updated;
  - older server (or endpoint missing) → survey imported from the JSON
    endpoint, no package folder, no errors;
  - survey imported with the previous app version → still opens; after an
    update from the server it gets its package folder;
  - interrupted download (airplane mode during the download) → the survey
    already on the device is unchanged.

## Follow-ups

- Show the survey branding (logos, landing background) from the package files.
- Use the preloaded map layers from the package files.
- Survey area of interest as survey file (openforis/arena#4588): provider for
  the arena-core expression evaluator reading the AOI from the package folder.
- Download progress (the zip can be large: the content length is known).
- Single format: import the survey part of a regular Arena export
  (`categories/` and `taxonomies/` read in parts).
