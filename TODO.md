# TODO

---

https://api.thetvdb.com/swagger#/Search

Config settings
- [ ] Generate on first run
- [ ] src folder, output folder
- [ ] TVDB user name/password

Performance
- [ ] If a show is an exact match, cache the show's id so there's one less
      request to make.
- [ ] Maybe cache the episode names as well so that it just becomes a lookup
      at that point.
- [ ] Maybe have a Refresh button for a series to get new data.

Layout
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
