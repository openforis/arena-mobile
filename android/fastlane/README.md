## fastlane documentation

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see
[Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## Android

### android test

```sh
[bundle exec] fastlane android test
```

Runs all the tests

### android beta

```sh
[bundle exec] fastlane android beta
```

Submit a new Beta Build to Play Store

### android build

```sh
[bundle exec] fastlane android build
```

Build the .aab file

### android upload_beta_to_play_store

```sh
[bundle exec] fastlane android upload_beta_to_play_store
```

Upload to beta

### android increment_version_code_in_project_gradle

```sh
[bundle exec] fastlane android increment_version_code_in_project_gradle
```

Responsible for fetching version code from play console and incrementing version
code.

---

This README.md is auto-generated and will be re-generated every time
[_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on
[fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on
[docs.fastlane.tools](https://docs.fastlane.tools).
