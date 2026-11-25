# Documentation

## For users

- [`user-manual/`](user-manual/): the user manual (`.docx` source; the `.pdf` is built by the User manual workflow), its screenshots and the scripts that build and translate it (see its [README](user-manual/README.md)).
- [`whats-new-2026/`](whats-new-2026/): the "What's new in 2026" presentation (`.pptx`, `.pdf`), its images and the narrated [video](whats-new-2026/video/README.md). Not used by the app (the in-app "What's new" dialog uses `assets/whatsNew/`).

## Reference notes

How a feature works now, kept up to date with the code:

- [`auto-sync-merge.md`](auto-sync-merge.md): automatic merge of records modified on several devices during auto-sync (rules, server requirements, known limitations, manual test scenarios).
- [`user-group-qualifiers.md`](user-group-qualifiers.md): user groups with qualifier values (prefill and lock of qualifier attributes, download guard, read-only records of other groups).

## Plans

[`plans/`](plans/): implementation plans and design notes written while building features that are now implemented. Kept for the design rationale; the code may have changed since.

- [`geospatial-pdf-maps-plan.md`](plans/geospatial-pdf-maps-plan.md): import of geospatial PDFs as offline map overlays.
- [`geotiff-maps-plan.md`](plans/geotiff-maps-plan.md): import of GeoTIFF files as offline map overlays.
- [`map-app-chooser-plan.md`](plans/map-app-chooser-plan.md): choice of the map app to open a coordinate, in-app location viewer.
- [`offline-maps-plan.md`](plans/offline-maps-plan.md): free map layers and download of offline map areas.
- [`position-tracking-plan.md`](plans/position-tracking-plan.md): GPS track recording while editing a record.
- [`position-tracking-test-plan.md`](plans/position-tracking-test-plan.md): manual device tests and remaining tasks for the position tracking release.
- [`survey-package-download-plan.md`](plans/survey-package-download-plan.md): download of the survey as a zip package with its files.
