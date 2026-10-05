# Code review — UI performance & correctness (Oct 2026)

Scope: whole `src/` tree (record editor, Redux state, shared components and screens, startup/hooks/utils, DB/services). Static review only: every finding below was traced in the source, but nothing was profiled on a device and `node_modules` was not installed, so internals of `@openforis/arena-core` (e.g. `Objects.isEqual`, `RecordUpdater`) were not inspected.

Severity: **H** = high, **M** = medium, **L** = low. 🐞 marks a correctness bug (not only perf).

---

## 1. Executive summary

The app's slowness comes mostly from **how often work is done**, not from any single slow function:

1. **No memoized selectors exist anywhere** (`createSelector` is not used in `src/`). Every `useSelector` runs its full computation — child-def sorting, ancestor walks, completion stats, validation scans — on **every Redux dispatch** (toasts, job progress, auto-sync, device info…), followed by a deep `Objects.isEqual` compare.
2. **Every edit replaces the whole record** in the store (`RECORD_SET`) and is **persisted before the UI updates** (synchronous `JSON.stringify` of the full record + SQLite write), so typing latency grows with record size.
3. **Per-field cost multiplies**: each form field subscribes to ~8–10 selectors, nothing in the `NodeDefFormItem` chain is `React.memo`'d, styles are recreated each render, and the carousel mounts *every* page.
4. **Unstable references** defeat memoization app-wide: the `useTranslation` wrapper returns a new `t` each render (47 files), `useSettings()` returns the whole slice (22 files), hook-based `StyleSheet.create` without `useMemo`.
5. **Production logging**: debug-level logs (incl. 33 `log.debug("rendering …")` in render bodies) are written to a file in release builds.
6. **Database has no indexes** on `record` and the records list parses every record's full JSON to read its validation.

There are also several **data-loss / race bugs** in record editing (section 7) that should be fixed before or together with the perf work, since the fixes touch the same code.

### Top 10 changes by expected impact

| # | Change | Where | Effort |
|---|--------|-------|--------|
| 1 | Make `useTranslation` return a stable `t` | `src/localization/index.ts:12-18` | XS |
| 2 | Logger: `severity: __DEV__ ? "debug" : "info"`, early-return before stringify, drop render-body debug logs | `src/utils/Logger.ts:86-123` | XS |
| 3 | Memoize hot selectors with `createSelector` (child defs, active child, bottom bar, breadcrumbs, completion %) | `src/state/dataEntry/selectors.ts`, `BottomNavigationBar`, `Breadcrumbs` | M |
| 4 | Update UI first (`RECORD_SET`), persist async through a serialized write queue | `src/state/dataEntry/actions.ts:492-500` | M |
| 5 | Remove async side effects from `useSelector` (items filter, coordinate distance target) | `useItemsFilter.ts:31-69`, `useNodeCoordinateComponent.ts:283-296` | S |
| 6 | Lazy-render carousel pages (only active ±1) | `RecordNodesCarousel.tsx:59-75` | XS |
| 7 | `useMemo` styles + `React.memo` on `RecordPageForm` / `NodeDefFormItem` / `NodeComponentSwitch` / attribute components | `NodeDefFormItem/styles.ts`, `RecordPageForm`, … | S |
| 8 | Memoize `useTreeData` | `PagesNavigationTree/useTreeData.ts:217-346` | XS |
| 9 | Don't block startup on remote login; parallelize init | `AppInitializer.tsx:78-133` | S |
| 10 | DB migration: indexes on `record` + precomputed validation summary columns | `src/db/migrations/` (new 003) | M |

---

## 2. Record editor rendering

| Sev | Finding | Location | Fix |
|-----|---------|----------|-----|
| H 🐞 | **Async expression evaluation inside `useSelector`.** For every code/taxon attribute with an items filter, each dispatch evaluates the filter expression for every item (possibly thousands of taxa), then deep-compares and `setState`s from a `.then`. Out-of-order resolution can set stale results; setState after unmount. | `nodeTypes/useItemsFilter.ts:31-69` | Select only inputs (`record`, parent node); evaluate in `useEffect` with a cancelled flag. |
| H | **Every text/number field recomputes the page's child defs on every dispatch** via `useIsNodeDefCurrentActiveChild` → `selectCurrentPageEntityRelevantChildDefs` (sort + filters). N fields ⇒ N sorts per dispatch, even in form mode where it's irrelevant. | `state/dataEntry/selectors.ts:381-397, 487-494`; `NodeTextComponent.tsx:36` | `createSelector` for child defs; one memoized `selectActiveChildDefUuid`; compare uuid (primitive). Or pass `isActive` from the carousel. |
| H | **`useBottomNavigationBar` does an ancestor walk + key-value formatting in a selector** on every dispatch, returns a new object deep-compared. | `BottomNavigationBar/useBottomNavigationBar.ts:54-146` | `createSelector` / `useMemo` over record, page entity, active index. |
| H | **Breadcrumbs (always mounted in AppBar) computes ancestor summaries, completion stats and scans all validations in a selector** on every dispatch. | `Breadcrumbs/useBreadcrumbItems.ts:122-197` | `useMemo` keyed on `record` reference etc. |
| H | **`useTreeData` is fully unmemoized** — rebuilds the navigation tree, completion stats and validation scan every render, and gives `TreeView` a new `data` array. Drawer stays open on tablets while typing. | `PagesNavigationTree/useTreeData.ts:217-346` | Wrap in `useMemo([survey, record, lang, currentPageEntity, showRecordCompletion])`. |
| H | **`RecordNodesCarousel` mounts a full `NodeDefFormItem` for every page.** `offscreenPageLimit` only limits native views; React still mounts all components and their store subscriptions. | `RecordNodesCarousel/RecordNodesCarousel.tsx:59-75` | Render content only when `Math.abs(i - activeChildIndex) <= 1`, placeholder otherwise. |
| M | **Hook styles recreated every render** (`StyleSheet.create` without `useMemo`), which invalidates `formItemComponentStyle`, `internalContainerStyle` and the `formItemComponent` `useMemo` in every field. | `NodeDefFormItem/styles.ts:4-44`, `BottomNavigationBar/styles.ts` | `useMemo(() => StyleSheet.create(...), [theme])` (as `NodeTextComponent/styles.ts` already does). |
| M | **Opening/closing the drawer re-renders the whole form.** `RecordPageForm`, `NodeDefFormItem` not memoized; `VirtualizedList` gets inline `renderItem/getItem/getItemCount`. | `RecordEditor.tsx:31,75`, `RecordPageForm.tsx`, `NodeEntityFormComponent.tsx:33-38` | `React.memo` the form chain; `useCallback` list callbacks. |
| M | **Full-record completion stats computed twice per edit** (AppBar + drawer), plus similar work in breadcrumbs and tree. | `RecordCompletionProgressBar.tsx:12-22` | One shared memoized `selectRecordCompletionPercent`. |
| M | **Taxon autocomplete re-filters up to 1000+ taxa every render** because `selectedItems={selectedTaxon ? [selectedTaxon] : []}` and `itemLabelExtractor({nodeDef})` are new each render; debounce is recreated (and never cancelled). Label/vernacular lowercasing done per keystroke. | `NodeTaxonAutocomplete.tsx:80-109,173,177`; `SelectableListWithFilter.tsx:41-49,57-89,160-164` | Memoize props; module-level default extractors/empty array; precompute lowercase search keys in `useTaxa`. |
| M 🐞 | **Async side effect in selector** in coordinate component (`getCoordinateDistanceTarget`), same pattern as items filter. | `useNodeCoordinateComponent.ts:283-296` | `useEffect([record, nodeUuid])` with cancellation. |
| M | `NodeMultipleEntityListComponent` re-formats summary values for **all** entities on any record change. | `NodeMultipleEntityListComponent.tsx:126,140-158,209-234` | Narrow selector / per-entity memo. |
| L-M | Per-attribute selectors (`useRecordAttributeInfo`, `useRecordChildNodes` used twice per attribute, validation selectors) wrap results in new objects and deep-compare each dispatch. | `state/dataEntry/selectors.ts:230-266, 549-683` | Per-instance memoized selectors (`useMemo(() => makeSelector(...))`), return primitives. |
| L | `PageNodesList` re-renders every row on each record change (`renderItemRightIcon` depends on `record`, inline lambdas). | `PageNodesList.tsx:93-135` | Precompute a `Map<defUuid, {errors, warnings}>`. |
| L | Inline per-row handlers in `MultipleAttributeComponentWrapper`. | `MultipleAttributeComponentWrapper.tsx:40,62` | Stable callbacks once items are memoized. |

---

## 3. Redux state & selectors

| Sev | Finding | Location | Fix |
|-----|---------|----------|-----|
| H | **No `createSelector` anywhere**; selector factories (`selectX({...})`) are built inline per render. `NodeDefFormItem` alone has ~8 subscriptions per field. | `state/dataEntry/selectors.ts:279-296, 381-397, 549-683`; `state/survey/selectors.ts:45-56` | Introduce memoized selectors (RTK 2 `createSelector` w/ `weakMapMemoize`); child-def lists depend on survey/cycle/user/entityDef only, not the record. |
| H | **Every edit replaces the whole record**; 5 `useRecord()` subscribers re-render and recompute (tree, progress bar, multiple-entity list, page list, validation report). | `reducer.ts:26-38`, `actions.ts:492-500` | Subscribe to narrow derived values; longer-term, normalize nodes so unchanged nodes keep references. |
| H | **UI update waits for persistence** — `RecordService.updateRecord` does a sync `JSON.stringify(record)` on the JS thread + SQLite UPDATE before `RECORD_SET`. | `actions.ts:492-500`; `recordRepository.ts:409-430` | Dispatch first, persist via a per-record serialized, coalescing write queue. |
| M | **Job progress dispatches unthrottled** (`JOB_MONITOR_UPDATE` on every callback). Background auto-sync (every 90 s) therefore triggers all per-node selectors while the user is typing. | `state/jobMonitor/actions.ts:188-201` | Throttle (~4/s) and skip unchanged progress/status. |
| M | **Two dispatches per edit** (`markPending` + `RECORD_SET`); `markPending` always writes a new `lastLocalChangeAt`, re-rendering `useAutoSyncState` subscribers. | `actions.ts:498-499`; `autoSync/actions.ts:90-102` | Handle `RECORD_SET` in autoSync reducer, or batch. |
| M | **`useSettings()` returns the whole slice** (22 files, including every `NodeDefFormItem`, every `Button` via `useEffectiveTheme`). Toggling any setting (e.g. GPS lock) re-renders every field. | `state/settings/selectors.ts:5-10`; `components/Button.tsx:96` | `useSetting(key)`; buttons use Paper `useTheme()`. |
| M | Dev-only: RTK immutable/serializable checks deep-walk survey + record on every dispatch — dev builds feel far slower than prod and mislead profiling. | `state/store.ts:4` | Disable or `ignoredPaths` for `survey`, `dataEntry.record`, `dataEntry.previousCycleRecord`. |
| L | `useDeviceInfo` / `useAutoSyncState` subscribe to whole slices (StatusBar re-renders on every disk/battery/network check). | `deviceInfo/selectors.ts:24`, `autoSync/selectors.ts:7` | Field-level selectors. |
| L | Dead code: `debounceAction` ignores `key`, `cancelDebouncedAction` emits an unhandled action; unused selectors `useRecordEntitiesUuidsAndKeyValues`, `useCurrentSurveyRootDef`. | `storeUtils.ts:20-28`; `selectors.ts:614`; `survey/selectors.ts:95` | Remove / replace. |

---

## 4. Lists, shared components, other screens

| Sev | Finding | Location | Fix |
|-----|---------|----------|-----|
| H | **`useTranslation` wrapper returns a new `t` every render** → every `useMemo`/`useCallback`/effect depending on `t` re-runs each render (47 files). E.g. records list re-formats and re-sorts all records every render. | `src/localization/index.ts:12-18`; `RecordsDataVisualizer.tsx:317-354`; `useRecordsList.ts:457-474`; `RecordValidationReport.tsx` | `const t = useCallback(..., [i18nT]); return useMemo(() => ({ t }), [t])`. |
| H 🐞 | **Records list can re-render in a loop while a search is active**: effect on `[records, onSelectedRecordUuidsChange]` sets a new `[]` in the parent → new `t` → new `recordsFiltered` → effect again. Without search it still wipes the selection on any parent re-render. | `RecordsDataVisualizer.tsx:284-287`; `RecordsList.tsx:124`; `useRecordsList.ts:457` | Fix `t`; key effect on joined uuids; skip setState when already empty. |
| H | **`DataTable` renders all rows in a `ScrollView`** (no virtualization; records list doesn't enable pagination) and **scrolls to top whenever `visibleRows` identity changes** (i.e. on any parent re-render / checkbox tap). | `components/DataTable/DataTable.tsx:94-97,128` | `FlatList` with memoized row, or pagination by default; scroll to top only on key/sort change. |
| H 🐞 | **`DataList` keyed by `item.uuid`** while items use `key` (validation report items have no `uuid` → all keys `undefined`). Selection never resets (`useSelectableList` depends on an `items` prop nobody passes; `selectedItemIds` not forwarded). | `DataList.tsx:38-44,115`; `useSelectableList.ts:11,30-33` | `keyExtractor={i => i.key}`; pass `items` and `selectedItemIds`. |
| M | `DataList` rows not memoized, `useStyles` rebuilt each render, and the `FlatList` sits in a non-flex `VView` (likely disabling windowing — verify on device). | `DataList.tsx:46-106`; `DataList/styles.ts` | Memo row component; memo styles; `fullFlex`. |
| M | `SelectableList` items not memoized; no `getItemLayout` for fixed-height rows. | `SelectableList.tsx:38-75,122-142` | `React.memo`, `getItemLayout`. |
| M | Every `Text` calls react-i18next `useTranslation` (one subscription per instance) even without `textKey`; `FormItem` inline style arrays defeat `HView` memo. | `components/Text.tsx:51-52`; `FormItem.tsx:33-37` | Split `TranslatedText`; hoist styles; `React.memo` base components. |
| M 🐞 | `useScreenKey` returns the **focused** route, not the caller's, and isn't reactive → background screens (e.g. RecordsList under RecordEditor) read the wrong view mode / header state. | `hooks/useScreenKey.ts:3-7`; `AppBar.tsx:92-103` | `useRoute().name`. |
| M | `AppBar` of **every stacked screen** subscribes to ~10 record selectors + whole settings → all headers re-render on each edit. | `navigation/AppBar.tsx:97-118,182` | Extract `RecordEditorAppBarActions` mounted only on the editor route. |
| M | `SurveysListRemote`: items mapped inline each render; `StatusCell` does a linear `find` per cell (O(n²)); `loadSurveys` unstable → focus listener re-added each render. | `SurveysListRemote.tsx:53-66,110,211` | `useMemo` + uuid map; `useCallback`. |
| L-M | `RecordValidationReport` inline `fields` and unstable `onRowPress`. | `RecordValidationReport.tsx:203-213` | Hoist / `useCallback`. |
| L | `CollapsiblePanel` styles rebuilt; `Tooltip` builds a new theme per render (used in every table row). | `CollapsiblePanel/styles.ts`; `Tooltip.tsx:17-26` | `useMemo`. |
| L 🐞 | Survey search box clears whenever `surveys` changes (e.g. after "Check updates"). | `SurveysList/useSurveysSearch.ts:14-16` | Derive with `useMemo`. |
| L | `ImagePreviewDialog` copies the image twice on iOS; changelog dialog re-fetches and renders the full CHANGELOG each open; `SettingsScreen` keeps a stale local settings copy. | `ImagePreviewDialog.tsx:47,136`; `ChangelogViewDialog.tsx:53-79`; `SettingsScreen.tsx:52-65` | Resolve once / cache / read from store. |

---

## 5. Startup, hooks, utilities

| Sev | Finding | Location | Fix |
|-----|---------|----------|-----|
| H | **Startup blocks on remote login**: with network + refresh token, `/auth/user` is awaited (axios timeout 40 s, refresh+retry on 401) → 40–120 s on loading screen on poor networks. | `AppInitializer.tsx:132-133`; `actionsLoginAndSetUser.ts:38-46`; `apiAxios.ts:10` | Fire-and-forget after init completes (`USER_LOADING` state exists), or short timeout. |
| H | **Debug logs written to file in production**: `severity: "debug"` + `fileAsyncTransport` when `!__DEV__`; `write()` `JSON.stringify`s args before any level check; 33 render-body `log.debug("rendering …")`. | `src/utils/Logger.ts:86-123` | Level by env; early return; remove render logs or guard with `__DEV__`. |
| H 🐞 | **`useIsMountedRef` never sets `false` on unmount** → all `isMountedRef` guards are no-ops: callbacks/setState after unmount, Bluetooth discovery leak in `useGpsDeviceDiscovery`, location callback after unmount. | `src/hooks/useIsMountedRef.ts:19-22` | `mountedRef.current = false` in cleanup. |
| H | **Sequential init**: device info (5 native calls one by one), temp-file cleanup, log rotation, settings, DB init all awaited in sequence; settings re-written right after being read. | `AppInitializer.tsx:78-131`; `deviceInfo/actions.ts:34-43`; `SystemUtils.ts:122-139`; `Logger.ts:33-70` | `Promise.all` independent steps; background cleanup/rotation; `setSettings` instead of `updateSettings`. |
| M | GPS locking at startup may show a permission dialog mid-init; `watchPositionAsync` with `timeInterval: 10` ms; subscription leaks if started twice. | `AppInitializer.tsx:99-102`; `settings/actions.ts:53-65` | Start after init; sane interval; remove previous subscription. |
| M | Magnetometer/heading hooks re-render up to 20×/s at 0.1° precision; throttle not cancelled on unmount. | `useMagnetometerHeading.ts:15-16,134`; `useLocationHeading.ts:157` | Round to 1°/skip small deltas; throttle 100–200 ms; `.cancel()`. |
| M 🐞 | 10 separate NetInfo listeners each starting at `false`; Redux `isNetworkConnected` only synced while the record editor's StatusBar is mounted → login logic sees stale network state. | `useIsNetworkConnected.ts:4-12`; `useIsNetworkConnectedMonitor.ts` | One app-level NetInfo subscription → Redux; initial state unknown. |
| M | All 10 language bundles (~900 KB source) parsed at startup; `am` and `sv` exist but are never registered. | `src/localization/i18n.ts:8-21`; `model/LanguageSettings.ts` | Load `en` + active language lazily; register or remove am/sv. |
| M | No `metro.config.js` / inline requires; `App.tsx` imports `utils`/`hooks` barrels pulling camera, sensors, Bluetooth, image manipulator, etc. before first render; `demoSurvey.json` (207 KB) imported at module top. | `App.tsx:20-23`; `src/utils/index.ts`; `src/hooks/index.ts`; `surveyService.ts:6` | Enable `inlineRequires`; direct imports at startup; lazy `require` demo survey. |
| M | `useLocationWatch` depends on whole settings; changing any setting during acquisition restarts/stops the GPS watch. | `useLocationWatch.ts:85-90`; `useLocation.ts:71-82` | Select needed fields; keep volatile values in refs. |
| L 🐞 | `useTextDirection` reads `i18n.language` without subscribing (RTL not updated on language change); async language detection can render first frames in the wrong language. | `useTextDirection.ts:12-16`; `i18n.ts:36-50` | Subscribe to `languageChanged`; synchronous initial detection. |
| L 🐞 | `ACCESS_MEDIA_LOCATION` check uses `androidApiLevel >= 10` (should be 29); image picker requests write-only media permission. | `src/utils/Permissions.ts:34,55` | `>= 29`; request read access. |
| L | `useRequestPermission` no initial check; orientation listener never removed; `useNavigationEvent` re-subscribes on unstable handler; splash → JS loading flash; undeclared deps `lodash.debounce`, `lodash.throttle`, `expo-keep-awake`. | various | See inline notes in original review. |

---

## 6. Data layer (SQLite, services, jobs)

| Sev | Finding | Location | Fix |
|-----|---------|----------|-----|
| H | **No indexes on `record`** besides PK, while all queries filter by `survey_id` + `uuid`/`cycle`/keys and sort by `date_modified`. Per-record updates in sync/import loops become O(N²). | `src/db/migrations/001.ts:17-41`; `recordRepository.ts` | New migration: `(survey_id, uuid)` unique, `(survey_id, cycle, date_modified DESC)`, optionally `(survey_id, cycle, key1)`. |
| H | **Records list parses every record's full JSON** (`json(content) ->> 'validation'`) and then `JSON.parse`s the validation tree in JS; no pagination. Runs on every RecordsList load, twice per sync, and in jobs. | `recordRepository.ts:63,198,644-647` | Store `errors_count`/`warnings_count` (or small summary) columns, backfill once; add `LIMIT/OFFSET`. |
| H | **`syncRecordSummaries` is O(N×M)** with key formatting inside the inner `find`; runs on every auto-sync tick. | `recordService.ts:305-319` (+ `:161,193,222,357`) | Pre-index remote by uuid and formatted keys. |
| H | **Every sync updates every remote summary row**, one autocommit each, even unchanged. | `recordService.ts:220-240`; `recordRepository.ts:360-393` | Transaction + skip unchanged rows. |
| H | **`rowToRecord` repairs every record on every fetch** (full parse, date fixing per node, `RecordFixer.fixRecord` with `hasToBeFixed` hard-coded `true`) — on record open and per record in exports. | `recordRepository.ts:653-694` | Run fixes once (data migration / version flag); export raw `content` string. |
| H | **CSV append rewrites the whole file every call** → flat export O(n²). | `src/utils/Files.ts:287-302`; `FlatDataExportJob.ts:164` | Buffer rows and flush periodically, or use file-handle append. |
| H 🐞 | **SQL syntax error** — stray `"}` in `WHERE survey_id = ? AND cycle IS NULL"}`; the error is swallowed, so the "fix empty cycle" data migration never runs. `fixRecordCycle` also uses a destructuring default that doesn't apply to `null`. | `recordRepository.ts:268,560`; `dataMigrationService.ts:22-24` | Remove `"}`; `record.cycle ?? default`; single `UPDATE`; log errors. |
| M 🐞 | `IN (...)` lists built with unescaped double-quoted values (identifier quoting; injection/breakage risk from imported uuids). | `db/dbUtils.ts:1`; `recordRepository.ts:497,533,569`; `surveyRepository.ts:76` | Bind `?` placeholders. |
| M 🐞 | Migration and `PRAGMA user_version` not in one transaction → a kill in between makes migration 002 re-run and fail ("duplicate column") forever. | `SQLiteClient.ts:96-100` | Same transaction; idempotent migrations. |
| M | Bulk writes without transactions (records import, clone into default cycle, revalidate). | `recordsImportJob.ts:44-54`; `recordService.ts:473-524` | Chunked transactions; honour `isCanceled()`. |
| M | Jobs call full `fetchRecords` (with JSON parse) just to get uuids. | `recordsImportJob.ts:38`; `recordsExportFileGenerationJob.ts:83-90`; `FlatDataExportJob.ts:91` | Cheap uuid queries. |
| M 🐞 | Flat export ignores selected cycle, can't be cancelled, copies ancestor files repeatedly. | `FlatDataExportJob.ts:91,97,171,262` | Pass `cycle`; cancel predicate; dedupe files. |
| M 🐞 | Remote job watcher can hang forever (socket opened after job start, no `connect_error`/timeout, `io` undefined on Expo Go iOS, listener never removed). | `remoteJobWatcherJob.ts:245-292`; `webSocketService.ts:7-9` | Initial status poll, error/timeout handlers, null guard, `off`. |
| M | Summary rows recompute root key defs / summary defs per row + 4× `fixDatetime`. | `recordRepository.ts:610-638` | Compute defs once per (survey, cycle). |
| M 🐞 | Full backup zips the live SQLite DB/WAL mid-write. | `backupJob/BackupJob.ts:34` | `wal_checkpoint(TRUNCATE)` or `VACUUM INTO` temp file. |
| L | `getDirSize` two sequential native calls per file; duplicate-key lookup runs two sequential unindexed queries on record open; `fetchSurveyById` uncached; `insertRecordSummaries` rebuilds SQL per row. | `Files.ts:75-131`; `recordService.ts:413-428`; `surveyService.ts:43-49`; `recordRepository.ts:322-356` | Parallelize / prepared statements / small cache. |

---

## 7. Correctness bugs to prioritise (record editing)

These overlap with the perf work and can cause **silent data loss**:

1. **Lost edit when moving between entity instances quickly** — `useNodeComponentLocalState` reuses component instances across entities; within the 500 ms debounce, `dirtyRef` keeps the old text displayed on the new entity, and the next keystroke `cancel()`s the previous entity's pending update. (`useNodeComponentLocalState.ts:40,59,123-125`) → flush (not cancel) on `nodeUuid` change/unmount and reset state, or `key={nodeUuid}` + flush on unmount.
2. **Concurrent record mutations overwrite each other** — `updateAttribute`, `addNewEntity`, `deleteNodes`, `addNewAttribute` read the record, `await` (dialogs, RecordUpdater, SQLite) and then `RECORD_SET` from the stale snapshot; an in-flight update can also resurrect the record after `DATA_ENTRY_RESET`. The 500 ms `entityCreationDelay` in `BottomNavigationBar.tsx:45` is a workaround for this. (`state/dataEntry/actions.ts:270-870`) → single promise queue; re-read state and re-check sync lock / record uuid after awaits.
3. **`dirtyRef` never cleared when an update is rejected** (sync in progress, confirm declined) → field shows a value that isn't in the record and stops receiving external updates. (`useNodeComponentLocalState.ts:57-60`) → thunk returns `{ applied }`, resync on false.
4. **Survey user group race** — group fetched for survey A can be written to survey B if the user switches mid-fetch. (`state/survey/actions.ts:32-70`) → re-check current survey before the final dispatch.
5. `selectCurrentPageEntity` throws "Record not found" and may hit the error boundary during the pop transition after `DATA_ENTRY_RESET` (not reproduced). (`selectors.ts:337-342`)

---

## 8. Suggested plan

**Phase 1 — quick wins (≈1–2 days, low risk)**
- Stable `t` (§4), logger level + remove render logs (§5), `useIsMountedRef` fix, `useMemo` on hook styles, `useMemo` in `useTreeData`, lazy carousel pages, `DataList` key fix, SQL `"}` fix, RTK dev middleware config, throttle job progress dispatches.

**Phase 2 — record editor responsiveness (≈1 week)**
- Serialized record-mutation queue + UI-first update with async coalesced persistence (fixes §7.1–7.3 too).
- `createSelector` for child defs / active child / bottom bar / breadcrumbs / completion %, `useSetting(key)`.
- Move async work out of selectors (`useItemsFilter`, coordinate distance).
- `React.memo` on the form-item chain; split `AppBar` record actions.

**Phase 3 — data & startup (≈1 week)**
- Migration 003: indexes + validation summary columns; pagination in records list.
- Index-based `syncRecordSummaries`; transactions for bulk writes; run `RecordFixer` once.
- Non-blocking login and parallel init; `inlineRequires`; lazy i18n bundles.

**Measuring progress:** enable React DevTools Profiler / `why-did-you-render` in a dev build with the RTK checks disabled, and record (a) time from keystroke to `RECORD_SET` on a large record, (b) renders per keystroke on a 30-field page, (c) RecordsList load time with 1,000 records, (d) cold start time to the home screen, before and after each phase.
