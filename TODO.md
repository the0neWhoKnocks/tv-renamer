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
- [ ] Nav
  - [ ] Version (button)
    - [ ] On click, will ping https://cloud.docker.com and get a list of
          versions.
  - [x] Config (button)
    - [x] On click, opens App config page
- [ ] 1 column layout, 2 panes
  - 1st section
    - [x] There are files that are pending a rename.
    - [x] Have a Preview button which will show what all the files will be
          renamed to.
      - [x] Once the preview has executed, have a Rename button
            appear that will rename, set permissions (if needed), and move the
            file.
      - [ ] Disable rename if no items are checked (after a preview)
  - 2nd section, a log of files that were renamed (From) -> (To)
    - [ ] Just load this on demand so that it's not eating up memory on every
          load.

---

## Misc
- [x] Script that generates test files
- [x] After build, remove files that don't need to be packaged.
- [ ] See if there's a way to make BrowserSync stop retrying after X amount
      of time.

---

## Performance
- [x] If a show is an exact match, cache the show's id so there's one less
      request to make.
- [x] Maybe cache the episode names as well so that it just becomes a lookup
      at that point.

---

## RenamableItem

- Label
  - [x] Is `contenteditable` in case a file's name doesn't match normal 
        naming patterns.
    - [x] On ENTER key, `blur`, don't allow a newline.
- [ ] Rename preview. Maybe it overlays the item.
- Alias (button), opens modal
  - [ ] Allow for inputting the TVDB series ID
  - [ ] If an alias is in use, the button will be green, otherwise some default
        gray or something.
- Refresh Cache (button)
  - [ ] Will display if data loaded from cache
  - [ ] On click, will tell the server to trash the cache for the series and
        get fresh data. Useful if the wrong show was cached, or when new
        season data comes out.
- Delete (button)
  - [ ] On  click, display confirmation modal
- [ ] Keep track of the indexes of items that are being processed. For example
  when Preview is hit, all indexes will be recorded. In the case where you want
  to change the id of just one item, record that index X was requested, then
  when the Array of results is returned you know that item X needs to be updated.

---

## Server
- [ ] Parse URL tokens
- [x] Service that can list folders in directory so a user can pick
      the `output`, and `source` directories.
