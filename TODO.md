# TODO

---

NFO Scraping
- [ ] move renamed file to season folder
  - [ ] Create season folder if not exists
  - [ ] Create series tvshow.nfo if not exists
    - [ ] allow user to pick
      - banner
      - clearlogo, logo
      - fanart
      - poster
  - [ ] Create <episode-name>.nfo file for episode. Would have to use a lot of
  the same media scraping logic from movie-list (ffmpeg).
  - [x] Sanitize XML data, replace things like `’` with `'` (GoT plot)
    - [ ] scrape <episode-name>-thumb.jpg for episode
      - allow user to pick season image
  - [ ] Notify User when scraping images since it can take a bit sometimes.
  
- Requirements for nfo files
  - for show https://kodi.wiki/view/NFO_files/TV_shows#nfo_Tags
    All items below are not required, just a template
    ```xml
    <?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
    <tvshow>
      <title></title>
      <plot></plot>
      <userrating></userrating>
      <mpaa></mpaa>
      <uniqueid type="" default="true"></uniqueid>
      <genre></genre>
      <premiered></premiered>
      <status></status>
      <studio></studio>
      <actor>
        <name></name>
        <role></role>
        <order></order>
        <thumb></thumb>
      </actor>
      <namedseason number="1"></namedseason>
    </tvshow>
    ```
  - for eps https://kodi.wiki/view/NFO_files/TV_shows#nfo_Tags_2
    All items below are not required, just a template
    ```xml
    <?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
    <episodedetails>
      <title></title>
      <showtitle></showtitle>
      <userrating></userrating>
      <plot></plot>
      <runtime></runtime>
      <uniqueid type="" default="true"></uniqueid>
      <credits></credits>
      <director></director>
      <aired></aired>
      <watched>false</watched>
      <actor>
        <name></name>
        <role></role>
        <order></order>
        <thumb></thumb>
      </actor>
      <fileinfo>
        <streamdetails>
          <video>
            <codec></codec>
            <aspect></aspect>
            <width></width>
            <height></height>
            <durationinseconds></durationinseconds>
            <stereomode></stereomode>
          </video>
          <audio>
            <codec></codec>
            <language></language>
            <channels></channels>
          </audio>
          <subtitle>
            <language></language>
          </subtitle>
        </streamdetails>
     </fileinfo>
    </episodedetails>
    ```

- [ ] Instead of two Preview buttons, have a drop-down to choose different episode groupings.
- Cypress tests
  - [ ] strip out un-needed data from cache files.
