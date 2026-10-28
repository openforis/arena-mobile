# Survey package download – implementation plan

Branch: `survey-package-download`

Companion plan (server): openforis/arena, branch `mobile-survey-package`,
`docs/superpowers/plans/2026-10-28-mobile-survey-package.md`.

## Goals

1. Download the survey from the server as a **zip package** (`survey.json` +
   `files.json` + `files/`) instead of the bare survey JSON, so the **survey
   files** (preloaded map layers, branding images; later the survey area of
   interest) are available on the device, offline.
2. Store the package files next to the survey JSON, without changing the way
   the survey JSON itself is stored: **no migration** of the surveys already on
   the device.
3. Stay compatible with **older servers** (no package endpoint) and with the
   environments where unzipping is not available (Expo Go, web preview): there
   the app keeps downloading the survey JSON as today.

Showing the branding images and using the preloaded map layers / area of
interest are follow-ups: this plan only makes the files available.

## Package layout (version 1, produced by the server)

```
survey.json        the survey (same object returned as `survey` by GET api/mobile/survey/:id)
files.json         { "version": 1, "files": [{ "uuid", "type", "name", "size" }] }
files/<uuid>       content of every file listed in files.json
```

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
survey_files/<localSurveyId>/files.json
survey_files/<localSurveyId>/files/<uuid>
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

### Task 1: storage of the package files (`SurveyFSRepository`)

`src/service/repository/surveyFSRepository.ts`:

- [ ] `getSurveyPackageDirUri({ surveyId })` → `${getSurveyFilesDirUri()}/${surveyId}`.
- [ ] `replaceSurveyPackageFiles({ surveyId, unzippedDirUri })`: deletes the
      current package folder (if any) and moves `files.json` and `files/` from
      the unzipped folder into it (`Files.moveFile`, which works for folders:
      `FileSystem.moveAsync`). Called only after the survey JSON has been
      stored successfully, so a failed download never leaves the survey without
      its previous files.
- [ ] `deleteSurveyPackageFiles({ surveyId })`: deletes the package folder
      (`Files.del(uri, true)`, idempotent).
- [ ] `getSurveyPackageFileUri({ surveyId, fileUuid })` and
      `readSurveyPackageFilesIndex({ surveyId })` (returns `null` when the
      folder or `files.json` is missing) for the follow-ups.
- [ ] `deleteSurveyFile` (survey deletion) also deletes the package folder.
- [ ] `getStorageSize` already sums the folder recursively
      (`Files.getDirSize` → `visitDirFilesRecursively`): check that sub
      folders are included.

### Task 2: package parsing (pure, unit tested)

`src/model/SurveyPackage.ts`:

```ts
export type SurveyPackageFile = { uuid: string; type: string; name?: string; size?: number };
export type SurveyPackageFilesIndex = { version: number; files: SurveyPackageFile[] };

const surveyFileName = "survey.json";
const filesIndexFileName = "files.json";
const filesDirName = "files";
const supportedVersion = 1;

// returns null for a missing / not supported index (the package is then used as survey JSON only)
const parseFilesIndex = (content: unknown): SurveyPackageFilesIndex | null => { ... };

export const SurveyPackage = { surveyFileName, filesIndexFileName, filesDirName, supportedVersion, parseFilesIndex };
```

- [ ] `src/model/SurveyPackage.test.ts` (jest, like `MapLayers.test.ts`): valid
      index, missing `files`, unsupported version → `null`, files without uuid
      skipped.

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
  4. read `survey.json` (`Files.readJsonFromFile`) and `files.json`
     (`SurveyPackage.parseFilesIndex`);
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
- [ ] `deleteSurveys`: also deletes the package folders (Task 1).

### Task 4: checks

- [ ] `yarn test`, `yarn test:types`, `yarn lint:check`.
- [ ] Manual test on a device / emulator (development build, not Expo Go):
  - new server: import a survey with branding images and preloaded map layers
    → `survey_files/<id>/files/` contains the files; survey usable offline;
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
