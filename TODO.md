# TODO

---

## Config settings
- [x] Generate on first run
- [x] Pick `source` and `output` folders
  - [x] Use ellipsis for long paths so a user can see what folder was selected
  - [x] On hover, show full path
  - [x] Load previously selected folder in FolderDisplay instead of default.
  - [x] Make it more clear what folders are readable/writable.
- [x] TVDB credentials
- [x] JWT info
- [ ] Extensions filter `.[avi,mkv,mp4]`
- [x] Don't allow Save if nothing's changed
- [x] Don't allow Close if required items are blank


---

## Layout
- [ ] 1 column layout, 2 panes
  - 1st section
    - [ ] There are files that are pending a rename.
    - [ ] Have a Preview button which will show what all the files will be
          renamed to. Once the preview has executed, have a Rename button
          appear that will rename, set permissions (if needed), and move the
          file.
    - [ ] Allow for manually renaming a file for files that don't match normal
          naming patterns.
          - [ ] On ENTER key `blur`, don't allow a newline.
  - 2nd section, a log of files that were renamed (From) -> (To)
    - [ ] Just load this on demand so that it's not eating up memory on every
          load.

---

## Misc
- [x] Script that generates test files
- [ ] Script to generate daemon file

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
- [x] Service that can list folders in directory so a user can pick
      the `output`, and `source` directories.
