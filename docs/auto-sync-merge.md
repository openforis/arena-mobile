# Auto-sync: automatic merge of records modified by several users

Plan and specification. Status at the time of writing: **phases 1 and 2 implemented** (see
"Implementation status"), later phases only planned.

## Background

Two users (or one user on two devices) can work on the same record at the same time, each on
their own offline copy. Arena Mobile detects this when it checks the sync status of the local
records against the server (`RecordService.syncRecordSummaries`):

| Sync status | Meaning |
| --- | --- |
| `modifiedLocally` | changed in the device only since the last sync |
| `modifiedRemotely` | changed on the server only since the last sync |
| `modifiedLocallyAndRemotely` | changed on both sides since the last sync |
| `conflictingKeys` | a *different* record (other uuid) with the same root key(s) exists on the server |

"Since the last sync" is measured against a baseline: the server's `dateModified` of the record
as last seen by this device (`date_modified_remote` column).

Before this work, auto-sync only uploaded `new` and `modifiedLocally` records. Everything else was
shown as a conflict, and the user had to open "Send data", choose "merge", and confirm.

## Goal

When auto-sync is enabled, a record modified on the server too must be synchronized without
asking and without being shown as a conflict that needs attention. Typical case: two users add
entities to different multiple entities of the same record (e.g. one adds trees, the other adds
deadwood pieces).

Out of scope for now: records with conflicting keys (two records that were never the same one)
keep requiring an explicit merge.

## How the server merges two versions of a record

Code: `Record.mergeRecords` in arena (`core/record/_record/recordsCombiner.js`), called by the
mobile data import job (`server/modules/mobile/service/arenaMobileDataImport/jobs/recordsImportJob.js`)
when the upload's conflict resolution strategy is `merge`. The server copy is the *target*, the
uploaded copy is the *source*.

| Node type | Rule |
| --- | --- |
| Single attribute | Source value replaces the target one if the target is empty, or the source node's `dateModified` is more recent. Depends on the device clocks. |
| Single entity | Merged recursively. |
| Multiple entity | Each source entity is matched to a target one by uuid, then by key values. Matched: merged recursively. Not matched: added. |
| Multiple attribute | Values of both sides are kept (no duplicates). Exception: multiple *code* attributes, where the source set replaces the target set if they differ. |

Consequences to keep in mind:

- **Nothing is ever deleted by a merge.** An entity deleted by one user stays, or comes back, if
  the other user still has it. This is unlike the default `overwriteIfUpdated` strategy
  (`Record.replaceUpdatedNodes`), which deletes from the server every node the uploaded copy
  doesn't have. That is why a record changed on both sides must never be sent with the overwrite
  strategy: it would delete what the other user added.
- **Permissions.** The merge is refused (`dataImport.recordOwnedByAnotherUser`) unless the user can
  edit the target record (`Authorizer.canEditRecord`): a user whose edit level is "own" can only
  merge records they own, i.e. the "two devices, same user" case.
- **Merge with same keys** (different record uuids) additionally requires the survey security
  option `allowRecordsMergeWithSameKeys`.

## Specification

### S1. Server: node uuids are kept when a record is merged with itself (arena)

When source and target have the **same record uuid**, nodes added from the source keep their
uuids (unless a node with that uuid already exists in the target). When the record uuids differ,
nodes get new uuids, as before (the source record can exist on its own on the server).

Why: with new uuids, the device's copy no longer matches the server after a merge, so

- a later overwrite upload would delete the other user's nodes and re-add the device's ones;
- a later merge would add the device's entities again, as duplicates, whenever they can't be
  matched by key.

With uuids kept, merging the same content twice changes nothing, and a device that hasn't yet
replaced its copy with the merged one stays consistent with the server.

### S2. Mobile: auto-merge candidates

A record is merged automatically by an auto-sync tick when all of these hold:

1. the auto-sync setting is enabled;
2. the survey is visible in mobile and allows downloading records in mobile (the merged record
   has to be downloaded afterwards, see S4);
3. its sync status is `modifiedRemotely` or `modifiedLocallyAndRemotely`;
4. if it is the record currently open in the editor, it hasn't been modified for at least the
   open-record idle interval (`settings:autoSyncOpenRecordIntervalMinutes`), and in any case
   (also with "Sync now", which bypasses that interval) for at least 5 seconds (see S5);
5. it has no validation errors, or the survey allows uploading records with errors.

### S3. Mobile: one upload per tick

The conflict resolution strategy applies to a whole upload, so records to merge can't share an
upload with `new`/`modifiedLocally` records: those must keep using `overwriteIfUpdated`, the only
strategy that propagates nodes deleted in the device.

A tick therefore uploads the `new`/`modifiedLocally` candidates if there are any; only when there
are none does it upload the auto-merge candidates, with strategy `merge`. Since auto-merge
candidates count as "pending" (S6), the next tick (90 seconds later) picks them up.

All candidates of a merge upload have the same uuid as their server record, so a merge upload from
auto-sync can never merge two different records.

### S4. Mobile: after a merge, the local copy is replaced by the merged record

The server's job result lists the records merged with their own server copy
(`mergedSameRecordUuids`). For each of them the device downloads the merged record and replaces
its local copy, keeping it a "local" record. This also stamps the sync baseline.

- From auto-sync this is silent: no progress dialog, no message. Failures are logged and set the
  auto-sync status to "check error", which stops further ticks until the user retries.
- The sync baseline of a merged record is stamped **only** by this download. If the download
  doesn't happen (failure, cancel, record opened in the editor meanwhile), the record keeps its
  conflict status and is merged again later. Stamping it earlier would make the record look
  `modifiedLocally`, and the next overwrite upload would delete the other user's nodes.
- No auto-sync tick starts while an upload is being followed up on.

### S5. Mobile: the record open in the editor

The editor holds the whole record in memory and writes the whole content back at every edit.
Replacing the stored record underneath it would be undone by the next edit. So:

1. **Lock.** When the open record is among the records to merge, the editor is made read-only
   before the upload starts: the keyboard is dismissed, a "This record is being synchronized"
   line is shown, inputs are disabled (`DataEntrySelectors.selectCanEditRecord`), and any edit
   that still reaches the store (e.g. a debounced text update) is rejected with a toast.
   Navigation between pages, and leaving the editor, stay possible.
2. **Reload.** Once the merged record is stored in the device, it is loaded into the editor. The
   current page is kept if its entity still exists in the merged record (always the case with S1),
   otherwise the editor goes back to the root page.
3. **Unlock.** Right after the reload, or when the upload ends in any other way (failure, cancel):
   a watchdog releases the lock as soon as nothing has been running for two checks in a row
   (3 to 6 seconds).
4. **Record opened during the upload.** A record that wasn't open when the candidates were
   selected, and is open and not locked when the upload completes, is not replaced: it keeps its
   conflict status and is merged again later.
5. **Record opened during the download.** A record whose local copy is being replaced can't be
   opened until that's done (toast "This record is being synchronized").
6. **Leaving the editor while locked** resets the lock; the record is then replaced like any
   other record.

### S6. Mobile: status shown to the user

With auto-merge allowed (S2.1 and S2.2), records in status `modifiedRemotely` or
`modifiedLocallyAndRemotely` make the overall auto-sync status "pending" ("will be sent
automatically") instead of "error" ("open Send data to resolve"). The per-record icon in the
records list is unchanged and shows the conflict until the merge has run.

Without auto-merge, nothing changes: those records need an explicit merge through "Send data".

## Implementation status

### Done (phases 1 and 2)

arena, branch `feat/records-merge-keep-node-uuids`:

- `core/record/_record/recordsCombiner.js`: S1.
- `test/unit/tests/015recordsMerge.test.js`: uuids kept for same-record merge, new uuids for
  different records, merging twice doesn't duplicate nodes.

arena-mobile, branch `feat/auto-sync-merge` (on top of `fix/merged-record-local-copy`):

- `src/state/autoSync/autoSyncStatusUtils.ts`: `isAutoMergeAllowed`,
  `sameRecordMergeableStatuses`, status computation (S6); `checkEnd` in
  `src/state/autoSync/actions.ts` reads the auto-sync setting.
- `src/state/dataEntry/actionsAutoSync.ts`: `selectAutoMergeCandidates`, one upload per tick
  (S2, S3).
- `src/state/dataEntry/actionsDataExport.ts`: baseline not stamped for merged records, open
  record skipped, silent download, "upload follow-up in progress" guard (S4, S5).
- `src/state/dataEntry/actionsRecordsImport.ts`: silent mode for the download and import of
  records.
- `src/state/dataEntry/actionsRecordSync.ts` (new): lock/unlock of the open record with its
  watchdog, reload of the open record, "being replaced" and "upload follow-up" guards (S5).
- `src/state/dataEntry/actions.ts`: edits rejected while locked; a record being replaced can't
  be opened. `selectors.ts`/`reducer.ts`/`types.ts`: `recordSyncInProgress` state.
- `src/screens/RecordEditor/RecordEditor.tsx`: "being synchronized" line.

### Deployment order

Deploy the server change (S1) before releasing the mobile one. Against a server without S1 the
flow still works as long as every merge is followed by the download of the merged record; when it
isn't (S5.4, or a failed download) the record is merged a second time, and entities that can't be
matched by key may be duplicated.

### Not verified yet

- The whole flow on a device against a real server: only unit tests, type check and lint were run.
- How the server matches entities that have no key attributes (`Records.findEntityByKeyValues`
  with no key values).
- That every input component of the editor becomes read-only through `selectCanEditRecord`
  (attribute inputs, new/delete entity buttons do; anything bypassing it relies on the store-level
  rejection only).
- That the record `dateModified` in the downloaded content equals the one in the server's records
  summary. If it didn't, a just-merged record would show as `modifiedRemotely` again.

## Known limitations

- Deletions are not propagated by a merge (see above).
- The same single attribute edited on both sides: the most recently modified value wins,
  according to the device clocks, with no notice to the user.
- A merge refused by the server (e.g. record owned by another user) fails the whole upload and
  stops auto-sync with a "check error" until the user retries; the retry fails the same way.
- Text typed in the instant the lock starts (not yet saved: text inputs save after a short
  delay) is rejected with a toast and lost when the merged record is loaded. Limited by the idle
  requirement of S2.4.
- The "being synchronized" message is only in English; other languages fall back to it.
- The whole merged record is downloaded, including all its files (see phase 3).
- Three sync status checks are run by the records list after a merge upload (one per silent job
  ending), where one would do.

## Plan for the next phases

### Phase 3: download only what changed

The upload already skips files the server has (`records/file-uuids`). The download has no
equivalent: `SelectedRecordsExportJob` always zips the record and all its files.

- arena: let `POST /survey/:surveyId/records/export` accept the file uuids the client already has
  (or an "exclude files" flag plus a way to fetch single files), and leave those out of the zip.
- arena-mobile: send the uuids of the files already stored for those records; `FilesImportJob`
  already imports only what the zip lists.

A further step is returning the merged nodes in the upload job result, so no download is needed at
all when no file changed. It needs the merge to be applied in the device with the same rules.

### Phase 4: deletions

Propagating deletions needs both sides to remember what was deleted and when (deleted-node
markers kept in the record until synced, in the device and on the server), and merge rules for
"deleted on one side, modified on the other". Largest item; until then auto-merge can bring back
deleted data.

### Open decisions

- Whether a user with edit level "own" may merge into a record owned by another user (today:
  refused). If not, such records should be reported as "needs manual fix" instead of failing the
  upload at every retry.
- Whether records with conflicting keys should also be merged automatically when the survey allows
  merging records with the same keys. Left manual: it joins two records that were never the same.
- Whether to let auto-merge run only against servers that have S1 (needs the server to advertise
  it, e.g. in the upload job result).

## Manual test scenarios

Two devices (A and B), same survey, auto-sync enabled on B, a user allowed to edit the record on
both.

1. **Different multiple entities.** Both fetch record R. A adds two trees and syncs. B adds a
   deadwood piece. Expected on B, without any dialog: status goes pending then synced; R contains
   the trees and the deadwood piece; same on the server.
2. **Same attribute.** A and B edit the same text attribute, B last. Expected: B's value on both.
3. **Record open on B.** As in 1, but B keeps R open and idle (or presses "Sync now"). Expected:
   the editor shows "being synchronized" and is read-only for a few seconds, then shows A's trees
   on the same page, editable again.
3b. **Record open on B, upload failing.** As in 3, with the network cut during the upload.
   Expected: the editor becomes editable again within a few seconds, content unchanged.
3c. **Record opened during the upload.** As in 1; open R right after the tick starts. Expected:
   R is not replaced while open; it's merged at a later tick.
4. **Repeated merge.** As in 1; then A adds another tree and syncs, B adds another deadwood piece.
   Expected: no duplicated entities on either side.
5. **Deletion.** A deletes a tree and syncs; B edits another attribute. Expected (known
   limitation): the tree is back on the server after B's merge.
6. **Download not allowed.** Survey with records download in mobile disabled. Expected: no
   automatic merge; the auto-sync status is "error" and "Send data" offers the merge, as before.
7. **Auto-sync disabled.** Expected: unchanged behaviour (explicit merge through "Send data").
8. **Owned by another user.** B's user has edit level "own" and R belongs to A's user. Expected
   (known limitation): the upload fails, auto-sync shows a check error.
