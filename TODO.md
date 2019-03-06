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
    - [ ] Bug: If there are no matches after a Preview, all items are unchecked
      but the global toggle still reads "Select None". Also, the Rename button
      is enabled and reads "Rename Selected".
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

## Release

- [ ] Use `npm version` to bump versions and create release tags. https://docs.npmjs.com/cli/version.html
  Use `--no-git-tag-version` while testing.

---

## RenamableItem

- Label
  - [x] Is `contenteditable` in case a file's name doesn't match normal 
        naming patterns.
    - [x] On ENTER key, `blur`, don't allow a newline.
- [x] Rename preview. Maybe it overlays the item.
  - [ ] Allow for editing preview text, like editing file text
- Alias (button), opens modal
  - [ ] Allow for inputting the TVDB series ID
  - [ ] If an alias is in use, the button will be green, otherwise some default
        gray or something.
- ID (button)
  - [ ] If the item has a TVDB match, the button will display the TVDB id
  - [ ] Clicking on the button will allow a user to change the id to another
    one in the case of a mis-match.
    - [ ] On change of an id, a search will be sent out, with the `name`, and
      an `id`. A manifest of cache files may have to be created so that a quick
      lookup could occur for the file.
      ```json
      {
        "tvdbid01": "cache_name.json",
        "tvdbid02": "cache_name.json",
      }
      ```
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
- [x] Deselect items that don't have matches

---

## Server
- [ ] Parse URL tokens
- [x] Service that can list folders in directory so a user can pick
      the `output`, and `source` directories.
- [ ] After an item is renamed, if it's source directory doesn't match the
  `sourceFolder` path, then the file was in a nested directory - delete it.
