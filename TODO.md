# TODO

---

NFO Scraping
- [x] move renamed file to season folder
  - [x] Create season folder if not exists
  - [x] Create series tvshow.nfo if not exists
    - [ ] allow user to pick
      - banner
      - clearlogo, logo
      - fanart
      - poster
  - [x] Create <episode-name>.nfo file for episode. Would have to use a lot of
  the same media scraping logic from movie-list (ffmpeg).
  - [x] Sanitize XML data, replace things like `’` with `'` (GoT plot)
    - [ ] scrape <episode-name>-thumb.jpg for episode
      - allow user to pick season image
  - [x] Notify User when scraping images since it can take a bit sometimes.
  
- Requirements for nfo files
  - for show https://kodi.wiki/view/NFO_files/TV_shows#nfo_Tags
  - for eps https://kodi.wiki/view/NFO_files/TV_shows#nfo_Tags_2

- [ ] Instead of two Preview buttons, have a drop-down to choose different episode groupings.
- Cypress tests
  - [ ] strip out un-needed data from cache files.
- [x] Fix "replace" dialog overflow when there's a bunch of items.
- Update Rename functionality
  - [x] It should only replace what is matched and leave the rest.
  - [x] Add a button to insert `(\d{2})` pattern, so it's easier to replace text
    while on Mobile.
  - [x] Have buttons below `Replace` input that insert `$NUM`. The buttons will
    display `$1` `$2`, etc, based on how many captured groups were added in the
    `Match` input and how many groups were matched.
  - [x] Store previous `Match` and `Replace` text in LocalStorage so it's easier
    to rename items later if the same patterns are needed.
      - Maybe add a Clear button to the inputs so it's easy to dismiss the
      pre-populated text if needed.
- [x] See if fanart.tv has episode images to fill in the gaps from tmdb.
  - They just have series and season images currently.
- [x] Refactor preview logic so cache and year logic is trimmed down and easier
  to deal with going forward.
  - load `ids` cache
    - if items have an id, load their cache
  - if there's no season or episode data, just add a placeholder item so there's
    no way a lookup could happen, or bad cache files created.
  - if there's season and episode data and no cache or an update was requested
    - create two Arrays
      - one for the initial lookup that scrapes and caches data
        - contains the first occurrence of a series
        - does the series and episode lookups
          - should return a list of newly updated cache items to be used on the
            second Array.
      - one for the remaining extra occurrences of a series
        - just reads from the cache
- [x] `runtime` isn't being set in `.nfo` for actual videos
- [x] Rename `Name (2019) - 1x01` shows odd matched colors. Things still work
  but it's visually off.
- Better series image fallbacks/handling
  - [x] See if images from fanart.tv have language props, and filter out non-English
    items.
  - [ ] Make sure that if the fanart images node is present, but poster and background
    aren't present, but tmdb does have values, that the tmdb values get used
    instead. May have to compile a list of available URLs
  - [ ] Sometimes a series season poster isn't available in fanart.tv, but there
    are images on tmdb. Currently it's a manual process of going to the series
    page, going into the seasons, right-clicking and opening the image, then
    changing the size value to `w780`, and download. Would be nice if this URL
    lookup could happen along with the background and poster props for tmdb.
  - Currently when images aren't downloaded, warnings are output. It'd be nice
    if there was also a way to output URLs to tmdb, tvdb, and fanart if any
    warnings pop up.
    - [ ] As previously mentioned, if no season poster was available, have a
      URL that goes to tmdb series seasons page.
    - [ ] If no (any other image) have a URL for tvdb series page.
    - [ ] For good measure, maybe have a URL for fanart, since it takes some
      effort to navigate to a series.
