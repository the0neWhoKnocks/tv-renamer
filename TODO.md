# TODO

---

- Add Cypress tests
  - [ ] silence server logs while testing
  - [ ] write test to ensure cache update works.
    - try to just intercept the response and delete an episode's data
  - [ ] write test to ensure assign ID works
  - [ ] strip out un-needed data from cache files.
- [ ] strip exclamation marks from search, `[Judas] Appare-Ranman! - S01E10.mkv`
- [x] add Search/Replace for files
  - `My Name is Earl S01-S04 Season 1-4/My Name Is Earl S01 Season 1/S01E01.mkv`
  - show preview of rename, and confirmation 'Rename' button


## Bugs

- [x] Clicking Preview after a Preview has just occurred (even with something)
  selected, causes unchecked items to return `undefined` (and highlight green),
  and the checked item to have no match found even though it just had a
  successful preview.
- [x] If there are no matches after a Preview, all items are unchecked
  but the global toggle still reads "Select None". Also, the Rename button
  is enabled and reads "Rename Selected".
- [x] Skip items, preview an item, rename that item, select an item and preview it.
  Previously skipped items will be reselected.
- [x] Remove formatting when pasting into content-editable Renamable item.
- [x] Uncaught error while loading a file, kills the server
  - log snippet
  ```
  Route matched "/api/v1/files-list" for /api/v1/files-list,
  undefined:1,
  ,
  ,
  ,
  SyntaxError: Unexpected end of JSON input,
      at JSON.parse (<anonymous>),
      at /home/node/app/cjs/server/routeHandlers/api/v1/utils/loadFile.js:18:40,
      at FSReqWrap.readFileAfterClose [as oncomplete] (internal/fs/read_file_context.js:53:3),
  ```
- [x] Sanitize Season name when creating a folder during a rename. Currently if
  a name has a colon, if F's up the folder.
- [x] `AssignId` doesn't display Search link if exact match found.
- [x] ‎Ensure new folder permissions match the file's permissions.
- [x] Preview may not be handling spaces and ampersands in file names.
  - `Carole and Tuesday s01e01`
  - `Carole & Tuesday s01e01` 
- [x] It's not deleting parent folder `Veep S01-S06 (1080p x265 10bit BugsFunny) [UTR]`
  after all files were moved successfully. Structure is
  ```
  Veep S01-S06 (1080p x265 10bit BugsFunny) [UTR]/S02/<files>
  ```
  So it seems it's not traversing to the root of source, just parent folder.
- [x] Extra space being added to file names that contain a colon.
- [x] No Results 'Assign' crashes App if no name was passed to the Assign modal.
No name was passed due to regex not matching pattern, in that case just use the
file name...

---

## Config settings
- [x] Generate on first run
- [x] Pick `source` and `output` folders
  - [x] Use ellipsis for long paths so a user can see what folder was selected
  - [x] On hover, show full path
  - [x] Load previously selected folder in `FolderDisplay` instead of default.
  - [x] Make it more clear what folders are readable/writable.
- [x] TVDB credentials
- [x] JWT info
- [ ] Extensions filter `.[avi,mkv,mp4]`
- [x] Don't allow Save if nothing's changed
- [x] Don't allow Close if required items are blank

---

## Layout
- [ ] Nav
  - [x] Version (button)
    - [ ] On click, will ping https://cloud.docker.com and get a list of
          versions.
  - [x] Config (button)
    - [x] On click, opens App config page
- [x] 1 column layout, 2 panes
  - 1st section
    - [x] There are files that are pending a rename.
    - [x] Have a Preview button which will show what all the files will be
          renamed to.
      - [x] Once the preview has executed, have a Rename button
            appear that will rename, set permissions (if needed), and move the
            file.
      - [x] Disable rename if no items are checked (after a preview)
  - 2nd section, a log of files that were renamed (From) -> (To)
    - [x] Just load this on demand so that it's not eating up memory on every
          load.
    - [x] Add toggle button to open or close this section.
  - [x] Check all 'put in folder' buttons for all checked items.

---

## Misc
- [x] Script that generates test files
  - [x] Allow for a `$1` filter, so during file generation it will only generate
  a file if it matches that pattern.
- [x] After build, remove files that don't need to be packaged.
- [ ] See if there's a way to make BrowserSync stop retrying after X amount
      of time.
- [x] Maybe during a rename, move the file to a folder with the same name
      of the show.
  - [x] Have a button that's just a folder icon

---

## Performance

- [x] If a show is an exact match, cache the show's id so there's one less
      request to make.
- [x] Maybe cache the episode names as well so that it just becomes a lookup
      at that point.

---

## Release

- [x] Create release shell script that
  - prompts for docker creds and if the login is successful, will save a creds
    file that it'll use in the future.
  - prompts for the semver
  - updates the package.json
  - builds out the assets
  - builds out the docker image
  - starts it up
  - waits for the user to say it's ok
  - tags the docker image
  - pushes it.
- [x] look up docker versions for version modal
  - https://forums.docker.com/t/how-can-i-list-tags-for-a-repository/32577/3
  - https://stackoverflow.com/a/39485542
  - https://stackoverflow.com/a/39454426
  - https://docs.docker.com/registry/spec/api/#listing-image-tags
- [ ] maybe use docker-compose in portainer?
- [ ] Set up a Credential Helper instead of using `.dockercreds` to get rid of
  `CLI is insecure` warning https://docs.docker.com/engine/reference/commandline/login/#credentials-store

---

## RenamableItem

- Label
  - [x] Is `contenteditable` in case a file's name doesn't match normal 
        naming patterns.
    - [x] On ENTER key, `blur`, don't allow a newline.
  - [x] On click (while the item is unselected), trigger a selection toggle
    and focus the editable element. Should save a click.
- [x] Rename preview. Maybe it overlays the item.
  - [ ] Allow for editing preview text, like editing file text
- Alias (button), opens modal
  - [x] Allow for inputting the TVDB series ID
  - [ ] If an alias is in use, the button will be green, otherwise some default
        gray or something.
- ID (button)
  - [x] If the item has a TVDB match, the button will display the TVDB id
  - [x] Clicking on the button will allow a user to change the id to another
    one in the case of a mis-match.
    - [x] On change of an id, a search will be sent out, with the `name`, and
      an `id`. A manifest of cache files may have to be created so that a quick
      lookup could occur for the file.
      ```json
      {
        "tvdbid01": "cache_name.json",
        "tvdbid02": "cache_name.json",
      }
      ```
- Refresh Cache (button)
  - [x] Will display if data loaded from cache
  - [x] On click, will tell the server to trash the cache for the series and
        get fresh data. Useful if the wrong show was cached, or when new
        season data comes out.
- Delete (button) (X icon)
  - [x] On click, display confirmation modal
   - [x] Modal will have the full path of the file (relative to source) so the
   user can see the file in context of a containing folder if there is one.
- [x] Keep track of the indexes of items that are being processed. For example
  when Preview is hit, all indexes will be recorded. In the case where you want
  to change the id of just one item, record that index X was requested, then
  when the Array of results is returned you know that item X needs to be updated.
- [x] Deselect items that don't have matches
- [ ] Checkbox to `Don't Move`, so it just renames in the current directory.
- ‎[ ] Allow for DVD order preview
  - ‎If DVD order is present, create a separate DVD node with that order in the 
  series cache
- [x] Ability to assign tvdb id to items with "no exact match found" - Kanata no astra

---

## Server
- [ ] Parse URL tokens
- [x] Service that can list folders in directory so a user can pick
      the `output`, and `source` directories.
- [ ] After an item is renamed, if it's source directory doesn't match the
  `sourceFolder` path, then the file was in a nested directory - delete it.
