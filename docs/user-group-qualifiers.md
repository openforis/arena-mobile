# User-group qualifiers

## Background

Arena survey attributes can be flagged as "qualifiers" (`NodeDefProps.qualifier`, exposed via
`Surveys.getQualifierDefs` in `@openforis/arena-core`). This is unrelated to node-def **key**
attributes — it's a separate flag a survey designer can set on any attribute.

Separately, `@openforis/arena-core` already defines a `UserGroup` type:

```ts
export type UserGroupQualifier = { name: string; value: string }
export type UserGroupProps = { name?: string; qualifiers?: UserGroupQualifier[] }
export type UserGroup = { uuid: string; surveyUuid?: string; props: UserGroupProps; ... }
```

The intent (inferred from the shape) is: a `UserGroup` represents a group of users who all share
fixed values for one or more qualifier attributes in a given survey — e.g. everyone in a "Region
North" group always enters records where the "region" qualifier attribute is "North".

As of `@openforis/arena-core` 1.3.10, this is a **dangling type**: nothing populates it, no Arena
server endpoint returns it, and no code in `arena-core` reads `UserGroup.props.qualifiers` anywhere
(confirmed by search across the whole package). This document proposes the changes needed in Arena
to make the concept usable, so that Arena Mobile can:

1. prefill a new record's qualifier attributes from the values fixed by the current user's group,
   and lock those attributes as non-editable;
2. prevent downloading/syncing existing records whose qualifier attribute values don't match the
   current user's group.

**Membership model**: a user belongs to at most **one** `UserGroup` per survey (not an arbitrary
list). This isn't a property of the user in general — it's survey-scoped, so it's only meaningful
once a specific survey is selected. Arena Mobile's mobile-side implementation of point 1 (prefill +
lock) fetches this single group from the server whenever the current survey changes, and is written
defensively (missing endpoint / offline / no group ⇒ simply no prefill/lock happens) so it activates
automatically once the change below ships. Point 2 is implemented server-side (see "Download guard"
below) and has no mobile-side implementation — non-matching records are simply absent from the
`records/summary` and `records/export` responses, which Arena Mobile already treats as the
authoritative record set.

## Proposed changes

### 1. Arena server: expose the current user's UserGroup for a survey

**Implemented.** The server exposes the single `UserGroup` (or nothing) that a given user belongs
to for a given survey:

```
GET /api/survey/{surveyId}/current-user-group
→ { "user": User, "userGroup": UserGroup | null }
```

The requesting user is identified via the auth token (not a path param) — this is deliberately
**not** part of the `/auth/login` / `/auth/user` response, since membership is per-survey and the
mobile app only needs it once a survey is selected, not for every survey the user could ever open.
Arena Mobile calls this when the current survey changes (see mobile-side notes below), using the
survey's `remoteId` and the existing auth token, mirroring how `recordRemoteService.ts` calls
survey-scoped endpoints like `api/survey/{remoteId}/records/summary` today.

Arena web / arena-core would need the underlying data model to actually resolve this (e.g. an
Arena-side table/relation associating a user with at most one `UserGroup` per survey) — out of
scope for this document to design, since it lives entirely server-side.

### 2. Arena server: download/export guard

**Implemented.** In `GET /api/survey/{surveyId}/records/summary` and
`POST /api/survey/{surveyId}/records/export`, when the requesting user belongs to a `UserGroup`
with qualifiers for that survey, the server excludes/rejects records whose qualifier-attribute
values don't match every qualifier value the group specifies.

This is the only correct enforcement point. Arena Mobile never sees a record's attribute values
until _after_ the server has already produced and served the full export zip
(`RecordRemoteService.startExportRecords` / `downloadExportedRecordsFile`) — by that point the data
has already left the server, so any client-side check can only be a UX nicety, never a real
security boundary.

### 3. Optional follow-up: expose qualifier values in the record summary

Not required for the initial change, but useful later: extend the record-summary response with a
`qualifiersObj` (mirroring the existing `keysObj` / `summaryAttributesObj` fields already returned
today), so Arena Mobile could grey out non-matching records in the UI _before_ attempting a fetch,
instead of only finding out after starting an export. This would require corresponding changes in
`arena-mobile/src/service/repository/recordRepository.ts` (new columns, mirroring
`SUPPORTED_KEYS` / `SUPPORTED_SUMMARY_ATTRIBUTES`) — left out of the current mobile change since
there's no server data to build or test it against yet.

## Mobile-side implementation (this repo)

- `SurveyService.fetchCurrentUserGroupRemote({ survey })` (`src/service/surveyService.ts`) calls
  `GET api/survey/{remoteId}/current-user-group` and returns `data.userGroup`. Best-effort: no `remoteId`, a
  remote error (e.g. offline / server error / endpoint not deployed yet) is handled by the caller
  (`SurveyActions.fetchCurrentSurveyUserGroup`), which falls back to the last successfully cached value in `PreferencesService` (or `null` if none was cached), so this never blocks survey selection.
- `SurveyActions.fetchCurrentSurveyUserGroup` (`src/state/survey/actions.ts`) dispatches the fetch
  and stores the result; it's called from `setCurrentSurvey` every time the current survey changes,
  and the group is reset to `null` whenever `CURRENT_SURVEY_SET` fires (switching survey invalidates
  the previous group).
- Stored in `state.survey.currentSurveyUserGroup`, read via
  `SurveySelectors.selectCurrentSurveyUserGroup` / `useCurrentSurveyUserGroup`.
- `UserGroupQualifiers` (`src/model/utils/UserGroupQualifiers.ts`) matches the survey's qualifier
  node defs (`Surveys.getQualifierDefs`) against `userGroup.props.qualifiers` by name, and resolves
  a qualifier's string value into a node value (category `itemUuid` lookup for code attributes, raw
  value otherwise).
- `DataEntryActions.createNewRecord` (`src/state/dataEntry/actions.ts`) prefills matching qualifier
  attributes right after the record's root entity is created.
- `useQualifierAttributeLocked` (`src/screens/RecordEditor/NodeDefFormItem/`) locks a qualifier
  attribute as read-only in the record editor whenever the current survey's user group supplies a
  value for it.
