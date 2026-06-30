# Export: Missing Files Confirm Dialog

**Date:** 2026-06-30
**Branch:** fix/record-files-missing

## Problem

When exporting records, some records may have file attributes that reference a `fileUuid` in the node value but whose actual file is missing from the local filesystem. Currently the job silently skips the missing file (logs an error) and the user only learns about it after the server processes the upload, via a toast. There is no chance to abort or acknowledge the issue upfront.

## Goal

Before exporting records (to the server **or** as a local share), if any selected records have missing files: show a single confirm dialog listing the affected records. If the user confirms, proceed with `skipMissingFiles=true` in the remote POST request. If the user cancels, abort the export entirely.

## Flow

```
exportRecords()
  └─ RecordsExportFileGenerationJob
       └─ result: { outputFileUri, recordsWithMissingFiles: [{uuid, keysText}] }

_onExportFileGenerationSucceeded()
  └─ if recordsWithMissingFiles.length > 0:
       show confirm dialog listing affected records
         ├─ cancel  → abort (return without showing target dialog)
         └─ confirm → set skipMissingFiles = true, proceed
  └─ show "select target" dialog (remote | share)

onExportConfirmed()
  ├─ remote → startUploadDataToRemoteServer({ ..., skipMissingFiles })
  │              └─ RecordsUploadJob({ ..., skipMissingFiles })
  │                   └─ RecordRemoteService.uploadRecords({ ..., skipMissingFiles })
  │                        └─ POST params: { ..., skipMissingFiles: true }
  └─ share  → Files.shareFile()   (no extra param needed)
```

## File Changes

### 1. `src/service/recordsExportFileGenerationJob.ts`

**`writeRecordFiles()`** — when `!Files.exists(fileUri)`, push `{ uuid: record.uuid, keysText }` to a local `missingFilesRecords` array. Return it alongside `recordFiles`.

**Key value extraction** — in `execute()`, after fetching the full record, call:
```ts
const keyValues = Records.getEntityKeyValues({
  survey,
  cycle,
  record,
  entity: Records.getRoot(record)!,
});
const keysText = keyValues.filter(Boolean).join(" - ");
```
Pass `keysText` into `writeRecordFiles` so it can attach it to any missing-file entry.

**`prepareResult()`** — return `{ outputFileUri, recordsWithMissingFiles }` where `recordsWithMissingFiles` is `Array<{ uuid: string; keysText: string }>`. Deduplicate by record UUID (a record is added once even if it has multiple missing files).

### 2. `src/state/dataEntry/actionsDataExport.ts`

**`_onExportFileGenerationSucceeded()`** — after receiving `result`, extract `recordsWithMissingFiles`. If the array is non-empty, show a confirm dialog (see UX section below). If the user cancels, return without showing the target dialog. If confirmed, set a local `skipMissingFiles = true` flag and continue to the target dialog.

Thread `skipMissingFiles` through to `onExportConfirmed` (existing `any`-typed call site, so no type breakage).

**`onExportConfirmed()`** — accept `skipMissingFiles` in its params object and forward it to `startUploadDataToRemoteServer`.

**`startUploadDataToRemoteServer()`** — accept `skipMissingFiles` and forward it to `RecordsUploadJob`.

### 3. `src/service/recordsUploadJob.ts`

Add `skipMissingFiles?: boolean` to the context type and constructor params. Forward it in the `RecordService.uploadRecordsToRemoteServer` call.

### 4. `src/service/recordRemoteService.ts`

**`uploadRecords()`** — add `skipMissingFiles?: boolean` to the function signature. Include it in the `params` object sent to `RemoteService.postCancelableMultipartData` (only on the final chunk, or on all chunks — consistent with other params like `conflictResolutionStrategy`).

### 5. `src/localization/en/dataEntry.ts`

Add under the `dataExport` namespace:

```ts
recordsWithMissingFilesConfirm: {
  title: "Missing files",
  message: "The following records have missing files and will be exported without them:\n{{recordsList}}\n\nDo you want to proceed anyway?",
}
```

`recordsList` is built in the action as a markdown bullet list:
```ts
const recordsList = recordsWithMissingFiles
  .map(({ keysText }) => `- ${keysText}`)
  .join("\n");
```

The confirm dialog uses `messageIsMarkdown: true`.

## UX — Confirm Dialog

- **Title key:** `dataEntry:dataExport.recordsWithMissingFilesConfirm.title`
- **Message key:** `dataEntry:dataExport.recordsWithMissingFilesConfirm.message`
- **Message params:** `{ recordsList }` (markdown bullet list of record key values)
- **messageIsMarkdown:** `true`
- **Confirm button:** `"common:yes"`
- **Cancel button:** `"common:cancel"`

## Out of Scope

- Translating the new key into all locales (can be done separately; English fallback applies).
- Changing the existing post-export toast for `missingFiles` from the server response.
