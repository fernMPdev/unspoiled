# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-11-08

### Added

- Spanish translation, including the extension name and description.
- ES | EN language toggle in the popup. The default follows the browser's
  language, and switching updates open YouTube tabs without a reload.

### Changed

- UI strings moved from `_locales/` to runtime dictionaries in
  `src/shared/locales/`, because `chrome.i18n` cannot switch language at
  runtime.

## [1.0.0] - 2026-11-08

### Added

- Hide the player progress bar and time readout, including the miniplayer and
  thumbnail hover previews.
- Hide video length badges and watch-progress bars on thumbnails.
- Hide chapter titles, chapter lists and description timestamps.
- Gate the comment section behind a "Show comments" button that resets on
  every navigation.
- Hide the up-next sidebar, end screen cards and autoplay countdown.
- Add rewind and skip buttons to the player, with configurable jump sizes
  (up to four, from 5 s to 1 h; 10 s and 1 min by default).
- Toolbar popup with a master switch, per-feature toggles and a jump size
  picker, synced through `chrome.storage.sync`.

[1.1.0]: https://github.com/fernMPdev/unspoiled/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/fernMPdev/unspoiled/releases/tag/v1.0.0
