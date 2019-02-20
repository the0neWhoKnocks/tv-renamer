# TODO

---

## Config settings
- [x] Generate on first run
- [ ] Pick `source` and `output` folders
- [x] TVDB credentials
- [x] JWT info
- [ ] Extensions filter `.[avi,mkv,mp4]`

---

## Layout
- [ ] 1 column layout, 2 panes
  - 1st section
    - [ ] There are files that are pending a rename.
    - [ ] Have a Preview button which will show what all the files will be
          renamed to. Once the preview has executed, have a Rename button
          appear that will rename, set permissions (if needed), and move the
          file.
  - 2nd section, a log of files that were renamed (From) -> (To)
    - [ ] Just load this on demand so that it's not eating up memory on every
          load.

---

## Misc
- [x] Script that generates test files

---

## Performance
- [ ] If a show is an exact match, cache the show's id so there's one less
      request to make.
- [ ] Maybe cache the episode names as well so that it just becomes a lookup
      at that point.
- [ ] Maybe have a Refresh button for a series to get new data.

---

## Server
- [ ] Parse URL tokens
- [ ] Service that can list folders in directory so a user can pick
      the `output`, and `source` directories.
