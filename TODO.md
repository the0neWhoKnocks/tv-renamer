# TODO

---

- [ ] Instead of two Preview buttons, have a drop-down to choose different
episode groupings.

- Add Cypress tests
  - [x] silence server logs while testing
  - [ ] write test to ensure cache update works.
    - try to just intercept the response and delete an episode's data. Look into
    `onResponse` https://github.com/cypress-io/cypress/issues/4665, so that I
    can use a majority of the actual data, but just manipulate parts.
  - [x] write test to ensure assign ID works
  - [ ] strip out un-needed data from cache files.
- [x] strip exclamation marks from search, `[Rel] Appare-Ranman! - S01E10.mkv`
- [x] add Search/Replace for files
  - `My Name is Earl S01-S04 Season 1-4/My Name Is Earl S01 Season 1/S01E01.mkv`
  - show preview of rename, and confirmation 'Rename' button
- [x] have Modals slide in/out
