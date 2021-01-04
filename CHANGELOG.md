# Changelog
---

## v4.0.0

**Bugfixes**
- [de9fbc3](https://github.com/the0neWhoKnocks/tv-renamer/commit/de9fbc3):  janky cacheKey logic
- [9028807](https://github.com/the0neWhoKnocks/tv-renamer/commit/9028807):  Image downloads and caching
- [e9cee0e](https://github.com/the0neWhoKnocks/tv-renamer/commit/e9cee0e):  Year not being maintained in name again
- [d2fe887](https://github.com/the0neWhoKnocks/tv-renamer/commit/d2fe887):  Error during rename based on DVD order
- [177ffe5](https://github.com/the0neWhoKnocks/tv-renamer/commit/177ffe5):  Can't see top of Replace dialog with Mobile keyboard
- [fead955](https://github.com/the0neWhoKnocks/tv-renamer/commit/fead955):  GoT episode numbering is wrong
- [8063841](https://github.com/the0neWhoKnocks/tv-renamer/commit/8063841):  Extra season episodes API call being made

**Dev-Ops**
- [b4dc8fe](https://github.com/the0neWhoKnocks/tv-renamer/commit/b4dc8fe):  Updated release script
- [2500551](https://github.com/the0neWhoKnocks/tv-renamer/commit/2500551):  Updated tests and data

**Features**
- [de34e20](https://github.com/the0neWhoKnocks/tv-renamer/commit/de34e20):  Added aliases
- [a8a9bca](https://github.com/the0neWhoKnocks/tv-renamer/commit/a8a9bca):  Rename status logs
- [b3e30c6](https://github.com/the0neWhoKnocks/tv-renamer/commit/b3e30c6):  Scrape file metadata for nfo
- [f460197](https://github.com/the0neWhoKnocks/tv-renamer/commit/f460197):  Set up Docker image with ffmpeg support
- [0f37b66](https://github.com/the0neWhoKnocks/tv-renamer/commit/0f37b66):  Series and season imagery are scraped
- [d5e0e6b](https://github.com/the0neWhoKnocks/tv-renamer/commit/d5e0e6b):  Episode stills are scraped
- [99b24f8](https://github.com/the0neWhoKnocks/tv-renamer/commit/99b24f8):  Account for misc. encoded characters
- [d3f0eb0](https://github.com/the0neWhoKnocks/tv-renamer/commit/d3f0eb0):  Create nfo files for series and episodes
- [e61cfa9](https://github.com/the0neWhoKnocks/tv-renamer/commit/e61cfa9):  Create Season or Specials folders for files
- [3b3492f](https://github.com/the0neWhoKnocks/tv-renamer/commit/3b3492f):  Data for episode.nfo added to cache
- [2c969da](https://github.com/the0neWhoKnocks/tv-renamer/commit/2c969da):  Auto-update cache if schema is different
- [061e16f](https://github.com/the0neWhoKnocks/tv-renamer/commit/061e16f):  Data for tvshow.nfo added to cache

**Uncategorized**
- [3e7e876](https://github.com/the0neWhoKnocks/tv-renamer/commit/3e7e876) doc: Added TODOs for scraping

---

## v3.4.0

**Bugfixes**
- [34b194c](https://github.com/the0neWhoKnocks/tv-renamer/commit/34b194c):  Steins Gate Zero not found

**Dev-Ops**
- [15a4a52](https://github.com/the0neWhoKnocks/tv-renamer/commit/15a4a52):  Added retry logic for tests
- [cd10d6b](https://github.com/the0neWhoKnocks/tv-renamer/commit/cd10d6b):  Added more logging for episode scraping

---

## v3.3.2

**Bugfixes**
- [ba5c21b](https://github.com/the0neWhoKnocks/tv-renamer/commit/ba5c21b):  Error during cache update

**Dev-Ops**
- [8080137](https://github.com/the0neWhoKnocks/tv-renamer/commit/8080137):  Added test to ensure assigned series year remains

---

## v3.3.1

**Bugfixes**
- [26deaf6](https://github.com/the0neWhoKnocks/tv-renamer/commit/26deaf6):  Assigned item removing year after cache update

---

## v3.3.0

**Dev-Ops**
- [a138c66](https://github.com/the0neWhoKnocks/tv-renamer/commit/a138c66):  Updated release script

**Features**
- [065e109](https://github.com/the0neWhoKnocks/tv-renamer/commit/065e109):  Place all files in a Series folder by default

---

## v3.2.0

**Bugfixes**
- [26cf285](https://github.com/the0neWhoKnocks/tv-renamer/commit/26cf285):  Assign errors after name update in GUI
- [0a934be](https://github.com/the0neWhoKnocks/tv-renamer/commit/0a934be):  statusCode error and inefficient series lookups

**Dev-Ops**
- [9f81cc6](https://github.com/the0neWhoKnocks/tv-renamer/commit/9f81cc6):  Tests weren't exiting with an error code
- [2c10b48](https://github.com/the0neWhoKnocks/tv-renamer/commit/2c10b48):  Allow for overriding the `debug` prefix in Containers
- [4c41692](https://github.com/the0neWhoKnocks/tv-renamer/commit/4c41692):  Got `debug` colors to work in Dev

**Features**
- [bd21601](https://github.com/the0neWhoKnocks/tv-renamer/commit/bd21601):  Normalize exact series name checks

---

## v3.1.0

**Bugfixes**
- [17cb76b](https://github.com/the0neWhoKnocks/tv-renamer/commit/17cb76b):  Non-selected items show up in Replace Modal
- [8840d82](https://github.com/the0neWhoKnocks/tv-renamer/commit/8840d82):  Anime episodes not found
- [3ea9bf7](https://github.com/the0neWhoKnocks/tv-renamer/commit/3ea9bf7):  Series not matched the same

**Features**
- [386c289](https://github.com/the0neWhoKnocks/tv-renamer/commit/386c289):  Remove spellcheck from Replace inputs
- [94c312e](https://github.com/the0neWhoKnocks/tv-renamer/commit/94c312e):  File paths in Replace Modal
- [0a33d42](https://github.com/the0neWhoKnocks/tv-renamer/commit/0a33d42):  Refined Search list in Assign ID Modal

**Misc. Tasks**
- [8b4ed6d](https://github.com/the0neWhoKnocks/tv-renamer/commit/8b4ed6d):  Tests for Anime numbering and Replace paths
- [9919c5f](https://github.com/the0neWhoKnocks/tv-renamer/commit/9919c5f):  Refined how the episode groups are handled

---

## v3.0.1

**Bugfixes**
- [32a8d6e](https://github.com/the0neWhoKnocks/tv-renamer/commit/32a8d6e):  Assign ID Modal errors when Air Date not set

**Dev-Ops**
- [8897fac](https://github.com/the0neWhoKnocks/tv-renamer/commit/8897fac):  Updated release script

**Uncategorized**
- [0980893](https://github.com/the0neWhoKnocks/tv-renamer/commit/0980893) Merge pull request #7 from the0neWhoKnocks/feat/tmdb

---

## v3.0.0

**Bugfixes**
- [17be94e](https://github.com/the0neWhoKnocks/tv-renamer/commit/17be94e):  Not all folders are deleted
- [dfaa6d8](https://github.com/the0neWhoKnocks/tv-renamer/commit/dfaa6d8):  Indicator still visible after error
- [37c2ad1](https://github.com/the0neWhoKnocks/tv-renamer/commit/37c2ad1):  Multiple re-renders and re-mounts of Modals
- [384898b](https://github.com/the0neWhoKnocks/tv-renamer/commit/384898b):  Misc. fixes due to TMDB change
- [9f10517](https://github.com/the0neWhoKnocks/tv-renamer/commit/9f10517):  camelCase throws when malformed Strings are passed
- [b382e84](https://github.com/the0neWhoKnocks/tv-renamer/commit/b382e84):  JS errors not surfaced in lookUpSeries
- [70c2eee](https://github.com/the0neWhoKnocks/tv-renamer/commit/70c2eee):  Assigning ID doesn't preview anymore

**Dev-Ops**
- [43c184a](https://github.com/the0neWhoKnocks/tv-renamer/commit/43c184a):  Have 'inspect' start on Server start

**Features**
- [823dbd2](https://github.com/the0neWhoKnocks/tv-renamer/commit/823dbd2):  Account for Config changes
- [df69ba6](https://github.com/the0neWhoKnocks/tv-renamer/commit/df69ba6):  Mini-Series-Search in the Assign ID Modal
- [a34e890](https://github.com/the0neWhoKnocks/tv-renamer/commit/a34e890):  Replace TVDB API with TMDB

**Misc. Tasks**
- [1020414](https://github.com/the0neWhoKnocks/tv-renamer/commit/1020414):  Added tests to verify folders are deleted
- [5b2917c](https://github.com/the0neWhoKnocks/tv-renamer/commit/5b2917c):  Added test for Assign-ID match item click
- [f2a5b0d](https://github.com/the0neWhoKnocks/tv-renamer/commit/f2a5b0d):  Added test to verify actual API functionality
- [98637cd](https://github.com/the0neWhoKnocks/tv-renamer/commit/98637cd):  Updated tests to account for TMDB
- [b358f7b](https://github.com/the0neWhoKnocks/tv-renamer/commit/b358f7b):  Move from 'request' to 'teeny-request'
- [c44b2f6](https://github.com/the0neWhoKnocks/tv-renamer/commit/c44b2f6):  Share Mobile media query

---

## v2.11.0

**Bugfixes**
- [ea33e20](https://github.com/the0neWhoKnocks/tv-renamer/commit/ea33e20):  Misc. styling issues
- [ab3618a](https://github.com/the0neWhoKnocks/tv-renamer/commit/ab3618a):  Replace unusable with lots of items

**Dev-Ops**
- [0f94967](https://github.com/the0neWhoKnocks/tv-renamer/commit/0f94967):  Update release config to only build and run the App

**Features**
- [7dc9ca6](https://github.com/the0neWhoKnocks/tv-renamer/commit/7dc9ca6):  On assignment of new id, preview all that match

---

## v2.10.0

**Bugfixes**
- [e0aadd8](https://github.com/the0neWhoKnocks/tv-renamer/commit/e0aadd8):  Not enough room for top nav on Tablet
- [b2bcef7](https://github.com/the0neWhoKnocks/tv-renamer/commit/b2bcef7):  Names with commas not showing Assign option
- [e649eb8](https://github.com/the0neWhoKnocks/tv-renamer/commit/e649eb8):  Name with exclamation mark Preview has no nav
- [b091b1b](https://github.com/the0neWhoKnocks/tv-renamer/commit/b091b1b):  dist folder not being cleaned out

**Dev-Ops**
- [63b8016](https://github.com/the0neWhoKnocks/tv-renamer/commit/63b8016):  Added/refactored tests
- [f551cc8](https://github.com/the0neWhoKnocks/tv-renamer/commit/f551cc8):  Refactored e2e tests
- [e2e48ba](https://github.com/the0neWhoKnocks/tv-renamer/commit/e2e48ba):  Can now skip build step in headless e2e
- [27a8677](https://github.com/the0neWhoKnocks/tv-renamer/commit/27a8677):  Updated release script
- [b5ccabc](https://github.com/the0neWhoKnocks/tv-renamer/commit/b5ccabc):  Granular logging

**Features**
- [b6b5e61](https://github.com/the0neWhoKnocks/tv-renamer/commit/b6b5e61):  Use an SVG for the TVDB icon

---

## v2.9.1

**Bugfixes**
- [8a7adfd](https://github.com/the0neWhoKnocks/tv-renamer/commit/8a7adfd):  Episodes look-up timout message not shown

---
## v2.9.0

**Bugfixes**
- [60360a3](https://github.com/the0neWhoKnocks/tv-renamer/commit/60360a3):  Exclamation mark returns bad results
- [d07184f](https://github.com/the0neWhoKnocks/tv-renamer/commit/d07184f):  Dates in release Modal misaligned
- [e5856bd](https://github.com/the0neWhoKnocks/tv-renamer/commit/e5856bd):  Hover triggered when button disabled
- [45d34a6](https://github.com/the0neWhoKnocks/tv-renamer/commit/45d34a6):  Server freezes when file is missing

**Dev-Ops**
- [ff52133](https://github.com/the0neWhoKnocks/tv-renamer/commit/ff52133):  Upgraded Cypress
- [43fe264](https://github.com/the0neWhoKnocks/tv-renamer/commit/43fe264):  Wired up WP dynamic imports
- [3d1cbd6](https://github.com/the0neWhoKnocks/tv-renamer/commit/3d1cbd6):  Upgraded ESLint
- [cef6232](https://github.com/the0neWhoKnocks/tv-renamer/commit/cef6232):  Added new release script

**Features**
- [89ff028](https://github.com/the0neWhoKnocks/tv-renamer/commit/89ff028):  Smoother transition for Modals
- [75bfdac](https://github.com/the0neWhoKnocks/tv-renamer/commit/75bfdac):  Ability to Search/Replace text in file names

**Uncategorized**
- [f675dee](https://github.com/the0neWhoKnocks/tv-renamer/commit/f675dee) doc: Added TODO items

---
## v2.8.1

**Bugfixes**
- [3446514](https://github.com/the0neWhoKnocks/tv-renamer/commit/3446514) - Cache update not working

---

## v2.8.0

**Bugfixes**
- [912a953](https://github.com/the0neWhoKnocks/tv-renamer/commit/912a953) - Errors weren't being returned
- [94188ed](https://github.com/the0neWhoKnocks/tv-renamer/commit/94188ed) - Upgraded vulnerable npm packages

**Dev-Ops**
- [28e3f8b](https://github.com/the0neWhoKnocks/tv-renamer/commit/28e3f8b) - Refactored to allow for mock e2e data
- [3299a4b](https://github.com/the0neWhoKnocks/tv-renamer/commit/3299a4b) - Added in Cypress for E2E tests
- [4c7b7a1](https://github.com/the0neWhoKnocks/tv-renamer/commit/4c7b7a1) - Tweak npm audit settings
- [9f6594d](https://github.com/the0neWhoKnocks/tv-renamer/commit/9f6594d) - Updated release script

**Misc. Tasks**
- [57f4e5c](https://github.com/the0neWhoKnocks/tv-renamer/commit/57f4e5c) - Removed Jest
- [a85bf65](https://github.com/the0neWhoKnocks/tv-renamer/commit/a85bf65) - Fixed ESLint config for React

**Uncategorized**
- [4b964ad](https://github.com/the0neWhoKnocks/tv-renamer/commit/4b964ad) test: Wrote more e2e tests
- [db89aee](https://github.com/the0neWhoKnocks/tv-renamer/commit/db89aee) test: Wrote more e2e tests

---

## v2.7.1

- [4b0191f](https://github.com/the0neWhoKnocks/tv-renamer/commit/4b0191f) fix: Nested files deleted after one file is renamed

---

## v2.7.0

- [053d52f](https://github.com/the0neWhoKnocks/tv-renamer/commit/053d52f) feat: Updated styling of 'Deleted folder' log to be more intuitive
- [44fa38f](https://github.com/the0neWhoKnocks/tv-renamer/commit/44fa38f) fix: Unhandled rejection after renames in nested directories
- [fcd8805](https://github.com/the0neWhoKnocks/tv-renamer/commit/fcd8805) Added debug logging for possible timeout scenario

---

## v2.6.1

- [f1d5a2c](https://github.com/the0neWhoKnocks/tv-renamer/commit/f1d5a2c) Ensure new folders don't end in a dot

---

## v2.6.0

- [0486e9f](https://github.com/the0neWhoKnocks/tv-renamer/commit/0486e9f) Remove duplicate ids when a user assigns an id

---

## v2.5.0

- [1560481](https://github.com/the0neWhoKnocks/tv-renamer/commit/1560481) Added Timeout Logging to Server

---

## v2.4.0

- [f4bfed8](https://github.com/the0neWhoKnocks/tv-renamer/commit/f4bfed8) Expanded Multi-Episode Parsing

---

## v2.3.0

- [8461c55](https://github.com/the0neWhoKnocks/tv-renamer/commit/8461c55) Added 'DVD order' option for episode names

---

## v2.2.1

- [d421344](https://github.com/the0neWhoKnocks/tv-renamer/commit/d421344) Handle timeout for JWT request

---

## v2.2.0

- [ea95ef7](https://github.com/the0neWhoKnocks/tv-renamer/commit/ea95ef7) Added timeouts to account for flakey TVDB API calls
- [c55074e](https://github.com/the0neWhoKnocks/tv-renamer/commit/c55074e) Ensure look-ups don't occur if JWT couldn't be found

---

## v2.1.0

- [f9c5467](https://github.com/the0neWhoKnocks/tv-renamer/commit/f9c5467) Handle episode numbers in the hundreds

---

## v2.0.0

- [c02bcaa](https://github.com/the0neWhoKnocks/tv-renamer/commit/c02bcaa) Account for series year and ignore Anime prefixes
- [315af0c](https://github.com/the0neWhoKnocks/tv-renamer/commit/315af0c) Point TVDB API calls to v3.0.0

---

## v1.8.3

- [24775b8](https://github.com/the0neWhoKnocks/tv-renamer/commit/24775b8) Fixed overlapping trashcan icon

---

## v1.8.2

- [21a5cd2](https://github.com/the0neWhoKnocks/tv-renamer/commit/21a5cd2) Added error log for series lookup
- [f302116](https://github.com/the0neWhoKnocks/tv-renamer/commit/f302116) Removed error handler
- [7387995](https://github.com/the0neWhoKnocks/tv-renamer/commit/7387995) Updated search URL to account for TVDB site updates

---

## v1.8.1

- [fe3d403](https://github.com/the0neWhoKnocks/tv-renamer/commit/fe3d403) Patched Config error in Firefox
- [cdffa28](https://github.com/the0neWhoKnocks/tv-renamer/commit/cdffa28) Error handling for missing JWT

---

## v1.8.0

- [83f1522](https://github.com/the0neWhoKnocks/tv-renamer/commit/83f1522) Button to toggle all 'use folder' options in Renamable items
- [7c54e12](https://github.com/the0neWhoKnocks/tv-renamer/commit/7c54e12) Better handling of 'No Results' id assignment
- [d8cb31b](https://github.com/the0neWhoKnocks/tv-renamer/commit/d8cb31b) Patched error with getSeriesEpisodes request

---

## v1.7.1

- [665fa35](https://github.com/the0neWhoKnocks/tv-renamer/commit/665fa35) Don't allow Confirm & Assign buttons at the same time

---

## v1.7.0

- [20e2da9](https://github.com/the0neWhoKnocks/tv-renamer/commit/20e2da9) Ability to Assign TVDB id to Not Found items
- [8a1c92c](https://github.com/the0neWhoKnocks/tv-renamer/commit/8a1c92c) Allow for generating files based off of filter argument

---

## v1.6.7

- [0107c5a](https://github.com/the0neWhoKnocks/tv-renamer/commit/0107c5a) Patched release script
- [52838ad](https://github.com/the0neWhoKnocks/tv-renamer/commit/52838ad) Updated Docker Compose to work more like it does in Prod
- [12d9067](https://github.com/the0neWhoKnocks/tv-renamer/commit/12d9067) Updated doc
- [6565a1c](https://github.com/the0neWhoKnocks/tv-renamer/commit/6565a1c) Bug - Extra whitespace for file names with colons
- [f3401ca](https://github.com/the0neWhoKnocks/tv-renamer/commit/f3401ca) Upgrading Node caused a lock change

---

## v1.6.6

- [24b99d4](https://github.com/the0neWhoKnocks/tv-renamer/commit/24b99d4) Account for Special season number being zero

---

## v1.6.5

- [6e66433](https://github.com/the0neWhoKnocks/tv-renamer/commit/6e66433) Sort file list alphabetically
- [d1dd3f5](https://github.com/the0neWhoKnocks/tv-renamer/commit/d1dd3f5) Patched file names

---

## v1.6.4

- [e60217b](https://github.com/the0neWhoKnocks/tv-renamer/commit/e60217b) Patched episode parsing
- [bcb1941](https://github.com/the0neWhoKnocks/tv-renamer/commit/bcb1941) Brought in a2rp Babel plugin

---

## v1.6.3

- [0712c54](https://github.com/the0neWhoKnocks/tv-renamer/commit/0712c54) Delete parent folder when nested

---

## v1.6.2

- [e84fbdf](https://github.com/the0neWhoKnocks/tv-renamer/commit/e84fbdf) chown doesn't work with Docker and Node

---

## v1.6.1

- [ff347a8](https://github.com/the0neWhoKnocks/tv-renamer/commit/ff347a8) Patching folder perms

---

## v1.6.0

- [378a5a8](https://github.com/the0neWhoKnocks/tv-renamer/commit/378a5a8) Handle file names with spaces and ampersands
- [7646c98](https://github.com/the0neWhoKnocks/tv-renamer/commit/7646c98) Display Search link even if exact match found
- [f28f8b2](https://github.com/the0neWhoKnocks/tv-renamer/commit/f28f8b2) Use the same perms for a folder as the file being renamed

---

## v1.5.1

- [c35a418](https://github.com/the0neWhoKnocks/tv-renamer/commit/c35a418) Sanitize Season name for folder during rename

---

## v1.5.0

- [7b5b955](https://github.com/the0neWhoKnocks/tv-renamer/commit/7b5b955) Added Etag caching
- [ffe576d](https://github.com/the0neWhoKnocks/tv-renamer/commit/ffe576d) Moved files in prep for caching work
- [da12e6e](https://github.com/the0neWhoKnocks/tv-renamer/commit/da12e6e) Rename indicator for long requests
- [85fd74e](https://github.com/the0neWhoKnocks/tv-renamer/commit/85fd74e) Preview indicator for long requests

---

## v1.4.2

- [2dbc41f](https://github.com/the0neWhoKnocks/tv-renamer/commit/2dbc41f) Fixed JWT race condition

---

## v1.4.1

- [ee91c21](https://github.com/the0neWhoKnocks/tv-renamer/commit/ee91c21) Patched file load edge-case error
- [d18473f](https://github.com/the0neWhoKnocks/tv-renamer/commit/d18473f) Remove Paste formatting for content-editable item

---

## v1.4.0

- [488fd43](https://github.com/the0neWhoKnocks/tv-renamer/commit/488fd43) Add ability to delete files and folders via GUI

---

## v1.3.0

- [d7b684f](https://github.com/the0neWhoKnocks/tv-renamer/commit/d7b684f) Rename & move to series folder
- [a5023d5](https://github.com/the0neWhoKnocks/tv-renamer/commit/a5023d5) Bug - Skipped items being selected after rename
- [56b47f1](https://github.com/the0neWhoKnocks/tv-renamer/commit/56b47f1) Fixed FF row layout
- [b9e2f88](https://github.com/the0neWhoKnocks/tv-renamer/commit/b9e2f88) Updated release script

---

## v1.2.4

- [5468ab6](https://github.com/the0neWhoKnocks/tv-renamer/commit/5468ab6) Inexplicable selection of last editable Renamable
- [feb884e](https://github.com/the0neWhoKnocks/tv-renamer/commit/feb884e) Logs panel not displaying properly in FF
- [612e515](https://github.com/the0neWhoKnocks/tv-renamer/commit/612e515) Disable rename for skipped items
- [1ead562](https://github.com/the0neWhoKnocks/tv-renamer/commit/1ead562) Update series cache

---

## v1.2.3

- [7b07cef](https://github.com/the0neWhoKnocks/tv-renamer/commit/7b07cef) Fixed release script vars
- [fbe57eb](https://github.com/the0neWhoKnocks/tv-renamer/commit/fbe57eb) Handle commit messages with single quotes
- [9d3f0ff](https://github.com/the0neWhoKnocks/tv-renamer/commit/9d3f0ff) Made version modal table header's sticky
- [0875a62](https://github.com/the0neWhoKnocks/tv-renamer/commit/0875a62) Create release script
- [63a1f26](https://github.com/the0neWhoKnocks/tv-renamer/commit/63a1f26) Display list of releases from DockerHub

---
