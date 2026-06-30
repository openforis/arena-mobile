# Export Missing Files Confirm Dialog — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Before exporting records (to server or local share), detect records with missing files and show a single confirm dialog; if confirmed, pass `skipMissingFiles=true` in the server upload POST request.

**Architecture:** `RecordsExportFileGenerationJob` already detects missing files per-record; we extend it to collect affected records and surface them in the job result. `actionsDataExport.ts` intercepts the result before showing the target selector and shows a confirm dialog. `skipMissingFiles` is threaded through the upload chain.

**Tech Stack:** TypeScript, Redux Toolkit thunks, `@openforis/arena-core` (Records), i18next, React Native.

## Global Constraints

- Never modify existing DB migrations.
- All source files use `.ts` / `.tsx`.
- Run `yarn lint` before committing.
- No new dependencies.
- Follow existing Redux thunk patterns (dispatch/getState, `ConfirmUtils.confirm`).
- Translation key added only to `en/dataEntry.ts` (other locales out of scope).

---

### Task 1: Track missing-file records in `RecordsExportFileGenerationJob`

**Files:**
- Modify: `src/service/recordsExportFileGenerationJob.ts`

**Interfaces:**
- Produces: `prepareResult()` now returns `{ outputFileUri: string; recordsWithMissingFiles: Array<{ uuid: string; keysText: string }> }`

- [ ] **Step 1: Add `recordsWithMissingFiles` class field**

In `RecordsExportFileGenerationJob`, add a property to track affected records. Place it right after `outputFileUri`:

```ts
export class RecordsExportFileGenerationJob extends JobMobile<RecordsExportFileGenerationJobContext> {
  outputFileUri: any;
  recordsWithMissingFiles: Array<{ uuid: string; keysText: string }> = [];
```

- [ ] **Step 2: Extract key values for each record in `execute()`**

Inside the `for (const recordSummary of recordsToExport)` loop, after fetching the full record (line ~97), compute `keysText` and pass it to `writeRecordFiles`:

```ts
for (const recordSummary of recordsToExport) {
  const { id: recordId, uuid } = recordSummary;
  const record = await RecordService.fetchRecord({ survey, recordId });
  if (!record.ownerUuid && user) {
    record.ownerUuid = user.uuid;
  }

  // compute key values text for missing-files tracking
  const recordCycle = Records.getCycle(record) || cycle;
  const keyValues = Records.getEntityKeyValues({
    survey,
    cycle: recordCycle,
    record,
    entity: Records.getRoot(record)!,
  });
  const keysText = (keyValues as any[]).filter(Boolean).join(" - ");

  const tempRecordFileUri = `${Files.path(
    tempRecordsFolderUri,
    uuid,
  )}.json`;
  await Files.writeJsonToFile({
    content: record,
    fileUri: tempRecordFileUri,
  });

  if (!Objects.isEmpty(nodeDefsFile)) {
    const { recordFiles, hasMissingFiles } = await this.writeRecordFiles({
      tempFolderUri,
      nodeDefsFile,
      record,
    });

    if (hasMissingFiles) {
      this.recordsWithMissingFiles.push({ uuid, keysText });
    }

    files.push(...recordFiles);
  }

  this.incrementProcessedItems();
}
```

- [ ] **Step 3: Return `hasMissingFiles` from `writeRecordFiles()`**

Change the return value of `writeRecordFiles` to also report whether any file was missing:

```ts
async writeRecordFiles({ tempFolderUri, nodeDefsFile, record }: any): Promise<{ recordFiles: any[]; hasMissingFiles: boolean }> {
  const { survey } = this.context;
  const surveyId = survey.id;

  const nodesFile = nodeDefsFile.reduce((acc: any, nodeDefFile: any) => {
    const nodeDefFileUuid = nodeDefFile.uuid;
    acc.push(...Records.getNodesByDefUuid(nodeDefFileUuid)(record));
    return acc;
  }, []);

  const recordFiles = nodesFile.reduce((acc: any, nodeFile: any) => {
    if (!nodeFile.value) return acc;
    const { fileName: name, fileSize: size, fileUuid } = nodeFile.value;
    acc.push({
      uuid: fileUuid,
      props: { name, size, nodeUuid: nodeFile.uuid, recordUuid: record.uuid },
    });
    return acc;
  }, []);

  let hasMissingFiles = false;

  for (const recordFile of recordFiles) {
    const { uuid: fileUuid } = recordFile;
    const fileUri = RecordFileService.getRecordFileUri({ surveyId, fileUuid });
    if (await Files.exists(fileUri)) {
      const destUri = `${Files.path(tempFolderUri, FILES_FOLDER_NAME, fileUuid)}.bin`;
      await Files.copyFile({ from: fileUri, to: destUri });
    } else {
      hasMissingFiles = true;
      this.logger.error(
        `File with uuid ${fileUuid} not found for record ${record.uuid}`,
      );
    }
  }

  return { recordFiles, hasMissingFiles };
}
```

- [ ] **Step 4: Update `prepareResult()` to include `recordsWithMissingFiles`**

```ts
override async prepareResult() {
  const { outputFileUri, recordsWithMissingFiles } = this;
  return { outputFileUri, recordsWithMissingFiles };
}
```

- [ ] **Step 5: Lint**

```bash
yarn lint
```

Expected: no errors.

- [ ] **Step 6: Type-check**

```bash
yarn test:types
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/service/recordsExportFileGenerationJob.ts
git commit -m "feat: track records with missing files in export job"
```

---

### Task 2: Add translation key

**Files:**
- Modify: `src/localization/en/dataEntry.ts`

**Interfaces:**
- Produces: `dataEntry:dataExport.recordsWithMissingFilesConfirm.title` and `dataEntry:dataExport.recordsWithMissingFilesConfirm.message` with param `{{recordsList}}`

- [ ] **Step 1: Add the new translation key inside `dataExport`**

In `src/localization/en/dataEntry.ts`, inside the `dataExport` object (after the `title` entry around line 79), add:

```ts
recordsWithMissingFilesConfirm: {
  title: "Missing files",
  message: `The following records have missing files and will be exported without them:\n{{recordsList}}\n\nDo you want to proceed anyway?`,
},
```

- [ ] **Step 2: Lint**

```bash
yarn lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/localization/en/dataEntry.ts
git commit -m "feat: add translation key for missing files confirm dialog"
```

---

### Task 3: Show confirm dialog and thread `skipMissingFiles` through the export action

**Files:**
- Modify: `src/state/dataEntry/actionsDataExport.ts`

**Interfaces:**
- Consumes: `result.recordsWithMissingFiles` — `Array<{ uuid: string; keysText: string }>` from Task 1
- Consumes: `dataEntry:dataExport.recordsWithMissingFilesConfirm.{title,message}` from Task 2
- Produces: `startUploadDataToRemoteServer` now accepts `skipMissingFiles?: boolean`

- [ ] **Step 1: Update `startUploadDataToRemoteServer` to accept and forward `skipMissingFiles`**

Change the function signature and pass `skipMissingFiles` to `RecordsUploadJob`:

```ts
const startUploadDataToRemoteServer =
  ({ outputFileUri, conflictResolutionStrategy, skipMissingFiles = false, onJobComplete = null }: any) =>
  async (dispatch: any, getState: any) => {
    const state = getState();
    const user = RemoteConnectionSelectors.selectLoggedUser(state);
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
    const cycle = Surveys.getDefaultCycleKey(survey);

    const uploadJob = new RecordsUploadJob({
      user,
      survey,
      cycle,
      fileUri: outputFileUri,
      conflictResolutionStrategy,
      skipMissingFiles,
    });
    // ... rest of the function unchanged
```

- [ ] **Step 2: Update `onExportConfirmed` to accept and forward `skipMissingFiles`**

```ts
const onExportConfirmed =
  ({
    selectedSingleChoiceValue,
    conflictResolutionStrategy,
    outputFileUri,
    skipMissingFiles = false,
    onJobComplete,
  }: any) =>
  async (dispatch: any) => {
    try {
      switch (selectedSingleChoiceValue) {
        case exportType.remote:
          dispatch(
            startUploadDataToRemoteServer({
              outputFileUri,
              conflictResolutionStrategy,
              skipMissingFiles,
              onJobComplete,
            }),
          );
          break;
        default:
          await Files.shareFile({
            url: outputFileUri,
            mimeType: Files.MIME_TYPES.zip,
            dialogTitle: t("dataEntry:dataExport.shareExportedFile"),
          });
      }
    } catch (error) {
      dispatch(handleError(error));
    }
  };
```

- [ ] **Step 3: Add the missing-files confirm dialog in `_onExportFileGenerationSucceeded`**

Replace the function with the version below. The key change: if `recordsWithMissingFiles` is non-empty, show a confirm dialog before the target dialog. If the user cancels, return early. If confirmed, set `skipMissingFiles = true`.

```ts
const _onExportFileGenerationSucceeded = async ({
  result,
  onlyLocally,
  onlyRemote = false,
  conflictResolutionStrategy,
  onJobComplete,
  dispatch,
}: any) => {
  const { outputFileUri, recordsWithMissingFiles = [] } = result || {};

  // If some records have missing files, ask user to confirm before proceeding
  if (recordsWithMissingFiles.length > 0) {
    const recordsList = recordsWithMissingFiles
      .map(({ keysText }: { keysText: string }) => `- ${keysText}`)
      .join("\n");

    const confirmed = await ConfirmUtils.confirm({
      dispatch,
      titleKey: "dataEntry:dataExport.recordsWithMissingFilesConfirm.title",
      messageKey: "dataEntry:dataExport.recordsWithMissingFilesConfirm.message",
      messageParams: { recordsList },
      messageIsMarkdown: true,
      confirmButtonTextKey: "common:yes",
    });

    if (!confirmed) return;
  }

  const skipMissingFiles = recordsWithMissingFiles.length > 0;

  const availableExportTypes = [];
  if (!onlyLocally) {
    availableExportTypes.push(exportType.remote);
  }
  if (!onlyRemote && (await Files.isSharingAvailable())) {
    availableExportTypes.push(exportType.share);
  }

  const onConfirm = async ({ selectedSingleChoiceValue }: OnConfirmParams) => {
    dispatch(
      onExportConfirmed({
        selectedSingleChoiceValue,
        conflictResolutionStrategy,
        outputFileUri,
        skipMissingFiles,
        onJobComplete,
      }),
    );
  };

  if (availableExportTypes.length === 1) {
    onConfirm({ selectedSingleChoiceValue: availableExportTypes[0] });
  } else {
    dispatch(
      ConfirmActions.show({
        titleKey: "dataEntry:dataExport.selectTarget",
        messageKey: "dataEntry:dataExport.selectTargetMessage",
        onConfirm,
        singleChoiceOptions: availableExportTypes.map((type) => ({
          value: type,
          label: `dataEntry:dataExport.target.${type}`,
        })),
        defaultSingleChoiceValue: availableExportTypes[0],
        confirmButtonTextKey: "common:export",
      }),
    );
  }
};
```

- [ ] **Step 4: Lint**

```bash
yarn lint
```

Expected: no errors.

- [ ] **Step 5: Type-check**

```bash
yarn test:types
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/state/dataEntry/actionsDataExport.ts
git commit -m "feat: show missing files confirm dialog before export target selection"
```

---

### Task 4: Thread `skipMissingFiles` through the upload job and service

**Files:**
- Modify: `src/service/recordsUploadJob.ts`
- Modify: `src/service/recordRemoteService.ts`

**Interfaces:**
- Consumes: `skipMissingFiles?: boolean` from Task 3's `startUploadDataToRemoteServer`
- Produces: POST params object in `recordRemoteService.ts` includes `skipMissingFiles`

- [ ] **Step 1: Update `RecordsUploadJob` to accept and forward `skipMissingFiles`**

```ts
import { JobMobile, JobMobileContext, SurveyMobile } from "model";

import { RecordService } from "./recordService";

type RecordsUploadJobContext = JobMobileContext & {
  cycle: string;
  fileUri: string;
  conflictResolutionStrategy: string;
  skipMissingFiles: boolean;
};

export class RecordsUploadJob extends JobMobile<RecordsUploadJobContext> {
  cancelUpload: any;
  remoteJob: any;
  constructor({
    user,
    survey,
    cycle,
    fileUri,
    conflictResolutionStrategy,
    skipMissingFiles = false,
  }: any) {
    super({ user, survey, cycle, fileUri, conflictResolutionStrategy, skipMissingFiles });
    this.cancelUpload = null;
    this.remoteJob = null;
  }

  async execute() {
    const { survey, cycle, fileUri, conflictResolutionStrategy, skipMissingFiles } = this.context;

    const startFromChunk =
      this.summary.processed > 0 ? Math.floor(this.summary.processed) : 1;

    const { promise, cancel } = RecordService.uploadRecordsToRemoteServer({
      survey: survey as SurveyMobile,
      cycle,
      fileUri,
      fileId: this.summary.uuid,
      conflictResolutionStrategy,
      skipMissingFiles,
      startFromChunk,
      onUploadProgress: (progressEvent: any) => {
        const { loaded, total } = progressEvent;
        this.summary.total = total;
        this.summary.processed = loaded;
        this.emitSummaryUpdateEvent();
      },
    });
    this.cancelUpload = cancel;
    const { data } = await promise;
    const { job } = data;
    this.remoteJob = job;
  }

  override async cancel() {
    this.cancelUpload?.();
    await super.cancel();
  }

  override async prepareResult() {
    const { remoteJob } = this;
    return { remoteJob };
  }
}
```

- [ ] **Step 2: Update `RecordRemoteService.uploadRecords` to accept and send `skipMissingFiles`**

In `src/service/recordRemoteService.ts`, update the function signature and add `skipMissingFiles` to `params`:

```ts
const uploadRecords = ({
  survey,
  cycle,
  fileUri,
  fileId,
  startFromChunk,
  conflictResolutionStrategy,
  skipMissingFiles = false,
  onUploadProgress,
}: {
  survey: SurveyMobile;
  cycle: string;
  fileUri: string;
  fileId: string;
  startFromChunk?: number;
  conflictResolutionStrategy: string;
  skipMissingFiles?: boolean;
  onUploadProgress: (progressEvent: any) => void;
}): { promise: Promise<any>; cancel: () => void } => {
```

Then inside the `chunkProcessor`, add `skipMissingFiles` to `params`:

```ts
const params = {
  file: content,
  fileId,
  chunk,
  totalChunks,
  totalFileSize,
  cycle,
  conflictResolutionStrategy,
  skipMissingFiles,
};
```

- [ ] **Step 3: Lint**

```bash
yarn lint
```

Expected: no errors.

- [ ] **Step 4: Type-check**

```bash
yarn test:types
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/service/recordsUploadJob.ts src/service/recordRemoteService.ts
git commit -m "feat: pass skipMissingFiles through upload job and remote service"
```

---

## Self-Review

**Spec coverage:**

| Spec requirement | Task |
|---|---|
| Detect records with missing files (fileUuid in value, file absent on disk) | Task 1 (`writeRecordFiles` `hasMissingFiles`) |
| Show single confirm dialog listing all affected record key values | Task 3 (`_onExportFileGenerationSucceeded`) |
| Applies to both remote upload and local share paths | Task 3 (confirm shown before target selection) |
| `skipMissingFiles=true` in POST request when confirmed | Tasks 3+4 |
| Translation key in `en/dataEntry.ts` | Task 2 |

**Placeholder scan:** None found.

**Type consistency:**
- `recordsWithMissingFiles: Array<{ uuid: string; keysText: string }>` — defined in Task 1, consumed in Task 3. ✓
- `skipMissingFiles?: boolean` — defined in Task 3, threaded through Tasks 4. ✓
- `hasMissingFiles: boolean` returned from `writeRecordFiles` — defined and consumed in Task 1. ✓
