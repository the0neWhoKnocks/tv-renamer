context('Renamer', () => {
  const SERIES_ID__BLADE_OF_THE_IMMORTAL = 92090;
  const SERIES_ID__FUTURAMA = 615;
  const SERIES_ID__HIGH_MAINTENANCE = 106014;
  const SERIES_ID__HUNTER_X = 46298;
  const DATA_SCRAPE_TIMEOUT = 2 * (60 * 1000); // 2 minutes
  const IMG_SCRAPE_TIMEOUT = 5 * (60 * 1000); // 5 minutes
  const E2E_FOLDER = '/repo/e2e';
  const acceptedExts = ['avi', 'mkv', 'mp4'];
  const appConfig = {};
  let fileItemsCount;
  let idsCacheMap;
  let idsCacheMapUpdated = false;
  let seriesIDs;
  let seriesIDsUpdated = false;
  
  let screenshotNdx = 0;
  function screenshot(selector, name) {
    const pad = (num, token='00') => token.substring(0, token.length-`${ num }`.length) + num;
    screenshotNdx++;
    cy.get(selector, { timeout: DATA_SCRAPE_TIMEOUT }).screenshot(`${ pad(screenshotNdx) }__${ name.replace(/\s/g, '-') }`);
  }
  
  function loadPage() {
    console.log('[START] to load page');
    cy.visit('/');
    console.log('[LOADED] page');
    
    cy.get('.app.is--visible');
    console.log('[APP_VISIBLE]');
    
    setUpAliases();
  }
  
  function toggleItem(name) {
    cy.get(`.renamable__ce-fix [spellcheck="false"]:contains(${ name })`)
      .each(($el) => {
        cy.wrap($el).closest('.renamable').find('> .toggle').click();
      });
  }
  
  // NOTE - aliases get reset between `it` cases regardless of page load, so
  // this'll only work in a `beforeEach` or for individual `it` blocks.
  function setUpAliases() {
    cy.get('.app__items-nav label[for="itemSelectToggle"]').as('ITEMS_NAV__TOGGLE_ALL');
    cy.get('.app__items-nav button[for="folders"]').as('ITEMS_NAV__FOLDERS_BTN');
    cy.get('.app__items-nav button[for="replace"]').as('ITEMS_NAV__REPLACE_BTN');
    cy.get('.app__items-nav button[for="preview"]').as('ITEMS_NAV__PREVIEW_BTN');
    cy.get('.app__items-nav button[for="rename"]').as('ITEMS_NAV__RENAME_BTN');
    
    console.log('[ALIASES] are set up');
  }
  
  function loadPageWithItems(items, cache) {
    const _items = (Array.isArray(items))
      ? items.join(' ')
      : items === 'all' ? '' : items;
    
    return new Cypress.Promise((resolve, reject) => {
      cy.exec(`node ${ E2E_FOLDER }/bin/genFiles.js ${ _items }`, { log: true }).then(() => {
        console.log('[GENERATED] files');
      });
      
      if(cache){
        // NOTE
        // - It's important that the *ids files are updated before a page
        // has loaded, otherwise there could be a partial mis-match while triggering
        // a Preview due to the ids being loaded on the Client, and random cache
        // files will be created.
        // - It's alright to delete cache files whenever, but I figured it just made
        // more sense to keep all the file operations in once place.
        
        if(cache.name){
          const cacheName = cache.name.endsWith('.json') ? cache.name : `${ cache.name }.json`;
          cy.exec(`rm -f "${ E2E_FOLDER }/mnt/data/tmdb__cache/${ cacheName }"`, { log: true }).then(() => {
            console.log(`[DELETED] "${ cacheName }"`);
          });
        }
        
        if(cache.mapID) {
          const idsCacheMapCopy = { ...idsCacheMap };
          delete idsCacheMapCopy[cache.mapID];
          cy.writeFile(`${ E2E_FOLDER }/mnt/data/tmdb__ids-cache-map.json`, idsCacheMapCopy, 'utf8').then(() => {
            console.log(`[REMOVED] "${ cache.mapID }" from ids cache map`);
          });
          idsCacheMapUpdated = true;
        }
        
        if(cache.seriesID) {
          const seriesIDsCopy = { ...seriesIDs };
          delete seriesIDsCopy[cache.seriesID];
          cy.writeFile(`${ E2E_FOLDER }/mnt/data/tmdb__series-ids.json`, seriesIDsCopy, 'utf8').then(() => {
            console.log(`[REMOVED] "${ cache.seriesID }" from series ids`);
          });
          seriesIDsUpdated = true;
        }
      }
      
      cy.then(() => {
        loadPage();
        resolve();
      });
    });
  }
  
  function resetData(stage) {
    const { VERSION__CACHE_SCHEMA } = require('/tmp/conf.app');
    
    if(stage === 'before'){
      cy.exec(`rm -f ${ E2E_FOLDER }/cypress/screenshots/renamer.test.js/*`, { log: true }).then(() => {
        console.log('[DELETED] screenshots');
      });
    }
    
    cy.exec(`(cd .. && git status --porcelain ${ E2E_FOLDER }/mnt/data/tmdb__cache)`, { log: true }).then(({ stdout }) => {
      const files = stdout
        .split('\n')
        .reduce((obj, changedFilePath) => {
          const normalizedPath = changedFilePath.trim();
          // Only reset Deleted, or Modified items for now. New items may indicate an issue, or there may just be new data.
          if(normalizedPath.startsWith('D')) obj.deleted.push(normalizedPath.replace('D ', ''));
          else if(normalizedPath.startsWith('M')) obj.modified.push(normalizedPath.replace('M ', ''));
          return obj;
        }, { deleted: [], modified: [] });
      
      const modifiedFiles = [];
      for(let i=0; i<files.modified.length; i++){
        const rawPath = files.modified[i];
        cy.readFile(`/repo/${ files.modified[i] }`, 'utf8').then(file => modifiedFiles.push({
          file,
          path: rawPath,
        }));
      }
      
      if(files.modified.length || files.modified.length){
        cy.then(() => {
          const filesToReset = modifiedFiles
            .filter(({ file: { schema }, path }) => schema === VERSION__CACHE_SCHEMA)
            .map(({ path }) => path)
            .concat(files.deleted)
            .map(path => `"${ path }"`);
          
          if(filesToReset.length){
            console.log(`[RESET] changed cache files\n  ${ filesToReset.join('\n  ') }`);
            cy.exec(`(cd .. && git checkout HEAD -- ${ filesToReset.join(' ') })`, { log: true }).then(() => {
              console.log('[DONE] reseting changed files');
            });
          }
        });
      }
      else console.log('[--] no cache files needed to be reset');
    });
    
    if(stage === 'after'){
      cy.then(() => {
        if(idsCacheMapUpdated){
          cy.writeFile(`${ E2E_FOLDER }/mnt/data/tmdb__ids-cache-map.json`, idsCacheMap, 'utf8');
          idsCacheMapUpdated = false;
          console.log('[DONE] reseting ids-cache-map.json');
        }
        else console.log("[--] ids-cache-map.json didn't need to be reset");
        
        if(seriesIDsUpdated){
          cy.writeFile(`${ E2E_FOLDER }/mnt/data/tmdb__series-ids.json`, seriesIDs, 'utf8');
          seriesIDsUpdated = false;
          console.log('[DONE] reseting series-ids.json');
        }
        else console.log("[--] series-ids.json didn't need to be reset");
      });
    }
  }
  
  before(() => {
    resetData('before');
    
    cy.readFile(`${ E2E_FOLDER }/mnt/data/config.json`, 'utf8').then(({
      outputFolder,
      sourceFolder,
    }) => {
      appConfig.output = outputFolder;
      appConfig.source = sourceFolder;
    });
    
    cy.readFile(`${ E2E_FOLDER }/mnt/data/tmdb__ids-cache-map.json`, 'utf8').then((cacheMap) => {
      idsCacheMap = cacheMap;
    });
    cy.readFile(`${ E2E_FOLDER }/mnt/data/tmdb__series-ids.json`, 'utf8').then((ids) => {
      seriesIDs = ids;
    });
  });
  
  after(() => {
    resetData('after');
  });
  
  it('should have the correct title', () => {
    loadPage();
    
    cy.get('title').contains('TV Renamer');
  });
  
  it('should verify the config', () => {
    loadPage();
    
    cy.get('.app__nav').contains(/Config$/).click();
    cy.get('input[name="sourceFolder"]').then($el => {
      expect($el.val()).to.equal(appConfig.source);
    });
    cy.get('input[name="outputFolder"]').then($el => {
      expect($el.val()).to.equal(appConfig.output);
    });
    screenshot('.app', 'config opened');
  });
  
  it('should have loaded files to rename', () => {
    loadPageWithItems('all').then(() => {
      let fileNames;
      cy.readFile(`${ E2E_FOLDER }/bin/files.txt`, 'utf8').then((names) => {
        const nameSort = (a, b) => {
          const _a = a.name.toLowerCase();
          const _b = b.name.toLowerCase();
          const subCheck = (_b > _a) ? -1 : 0;
          return (_a > _b) ? 1 : subCheck;
        };
        const items = names.split('\n');
        fileItemsCount = items.length - 1; // last line is blank
        
        fileNames = items
          .filter(n =>
            !!n
            && (new RegExp(`.(${ acceptedExts.join('|') })$`)).test(n)
            && !(new RegExp(`.sample.(${ acceptedExts.join('|') })$`)).test(n)
          )
          .map(n => {
            let [name, ext] = n.split(new RegExp(`.(${ acceptedExts.join('|') })$`));
            name = name.split('/').pop();
            return { name, ext }; 
          })
          .sort(nameSort);
      });
      
      const NON_VID_FILES_COUNT = 4; // .sample.ext, and .nfo files
      expect(fileNames.length).to.eq(fileItemsCount - NON_VID_FILES_COUNT);
      
      cy.get('.renamable__ce-fix [spellcheck="false"]')
        .each(($el, ndx) => {
          expect($el.text()).to.equal(fileNames[ndx].name);
        });
      
      screenshot('.app', 'files loaded');
    });
  });
  
  it('should preview and rename files with exact matches', () => {
    loadPageWithItems([
      '"30 coins"',
      'academia',
      'appare',
      'astra',
      'barry',
      'kemono',
      'black.monday',
      'blue.bloods',
      'bravest.warriors',
      'brooklyn',
      'burgers',
      'carole',
      'counterpart',
      'crashing',
      'deadly.class',
      'dirty.john',
      'doom.patrol',
      'forged',
      'future.man',
      'game.of.thrones',
      'genlock',
      'hyperdrive',
      'i.am.the.night',
      'kimetsu.no.yaiba',
      'loudermilk',
      'luther',
      'money.heist',
      'project.blue.book',
      'psych.season',
      'ray.donovan',
      'russian.doll',
      'seal.team',
      'sex.education',
      'smilf',
      'speechless',
      'star.trek.discovery',
      'stargate.sg-1',
      '"steins;gate.0"',
      'suits',
      'supernatural',
      'the.blacklist',
      'the.dragon.prince',
      'the.good.doctor',
      'the.good.place',
      'the.last.o.g.',
      'the.magicians',
      'the.orville',
      'the.punisher',
      'the.rookie',
      'the.umbrella.academy',
      'true.detective',
      'veep',
      'vikings',
      'wayne',
      '"you\'re.the.worst"',
      'young.justice',
      'young.sheldon',
    ]).then(() => {
      cy.get('@ITEMS_NAV__PREVIEW_BTN').click();
      
      // generate list with `[...document.querySelectorAll('.renamable.is--previewing.is--selected .renamable__new-name-text')].map(el => { const t = el.textContent; const q = t.includes("'") ? '"' : "'"; return `${q}${t}${q},`}).join('\n');`
      const newNames = [
        '30 Coins - 1x01 - Cobwebs.mkv',
        'Appare-Ranman! - 1x10 - The Bridge to Hell.mkv',
        'My Hero Academia - 4x11 - Lemillion.mkv',
        'Kemono Jihen - 1x01 - Kabane.mkv',
        'Astra Lost in Space - 1x01 - Planet Camp.mkv',
        'Barry - 2x08 - berkman (greater-than) block.mkv',
        'Black Monday - 1x01 - 365.mkv',
        'Black Monday - 1x02 - 364.mkv',
        'Blue Bloods - 9x11 - Disrupted.mkv',
        "Bob's Burgers - 9x11 - Lorenzo's Oil No, Linda's.mkv",
        'Bravest Warriors - 4x05x06 - From The Inside Room & All I Wish Is To Be Alone.mp4',
        'Brooklyn Nine-Nine - 6x01 - Honeymoon.mkv',
        'Carole & Tuesday - 1x02 - Born to Run.mkv',
        'Carole & Tuesday - 1x01 - True Colors.mkv',
        'Counterpart - 2x05 - Shadow Puppets.mkv',
        'Crashing (2017) - 3x01 - Jaboukie.mkv',
        'Deadly Class - 1x02 - Noise, Noise, Noise.mkv',
        'Dirty John - 1x01 - Approachable Dreams.mkv',
        'Dirty John - 1x02 - Red Flags and Parades.mkv',
        'Doom Patrol - 1x01 - Pilot.mkv',
        'Forged in Fire - 6x01x02 - Long Road to Redemption.mkv',
        'Future Man - 2x05 - J1- Judgment Day.mkv',
        'Game of Thrones - 0x55 - The Last Watch.mkv',
        'gen-LOCK - 1x01 - The Pilot.mkv',
        'Hyperdrive (2019) - 1x01 - Qualifier 1- Ready to Launch.mkv',
        'Hyperdrive - 1x01 - A Gift from the Glish.mkv',
        'I Am the Night - 1x01 - Pilot.mkv',
        'I Am the Night - 1x03 - Dark Flower.mkv',
        'Astra Lost in Space - 1x06 - Secret.mkv',
        'Demon Slayer- Kimetsu no Yaiba - 1x02 - Trainer Sakonji Urokodaki.mkv',
        'Money Heist - 1x02 - Episode 2.mkv',
        'Loudermilk - 2x03 - All Apologies.mp4',
        'Luther - 5x03 - Episode 3.mkv',
        "Marvel's The Punisher - 2x01 - Roadhouse Blues.mkv",
        'Project Blue Book - 1x01 - The Fuller Dogfight.mkv',
        'Psych - 2x01 - American Duos.mkv',
        'Psych - 2x02 - 65 Million Years Off.mkv',
        'Psych - 3x01 - Ghosts.mkv',
        'Ray Donovan - 6x11 - Never Gonna Give You Up.mkv',
        'Russian Doll - 1x01 - Nothing in This World Is Easy.mkv',
        'SEAL Team - 3x11x12 - Siege Protocol & Fog of War.mkv',
        'Sex Education - 1x02 - House Party.mkv',
        "SMILF - 2x02 - Sorry Mary, I'm Losing Faith.mkv",
        "Speechless - 3x09 - J-A- JAVIER'S P-A- PANTS.mkv",
        'Star Trek- Discovery - 2x01 - Brother.mkv',
        'Stargate SG-1 - 1x01x02 - Children of the Gods.mkv',
        'Steins;Gate 0 - 1x02 - Epigraph of the Closed Curve -Closed Epigraph-.mkv',
        'Suits - 8x12 - Whale Hunt.mkv',
        'Supernatural (2005) - 14x10 - Nihilism.mkv',
        'Supernatural (2005) - 14x15 - Peace of Mind.mkv',
        'The Blacklist - 6x02 - The Corsican.mkv',
        'The Dragon Prince - 2x03 - Smoke and Mirrors.mkv',
        'The Good Doctor - 2x11 - Quarantine Part Two (2).mkv',
        'The Good Place - 3x10 - The Book Of Dougs.mkv',
        'The Last O.G. - 3x04 - They Reminisce Over You.mkv',
        'The Magicians (2015) - 4x01 - A Flock of Lost Birds.mkv',
        'The Orville - 2x03 - Home.mkv',
        'The Rookie (2018) - 1x09 - Standoff.mkv',
        'The Umbrella Academy - 1x02 - Run Boy Run.mkv',
        'True Detective - 3x01 - The Great War and Modern Memory.mkv',
        'Veep - 1x01 - Fundraiser.mkv',
        'Veep - 2x08 - First Response.mkv',
        'Veep - 2x09 - Running.mkv',
        'Vikings (2013) - 5x17 - The Most Terrible Thing.mkv',
        "Wayne - 1x03 - CHAPTER THREE- 'THE GODDAMNED BEACON OF TRUTH'.mkv",
        "You're the Worst - 5x01 - The Intransigence of Love.mkv",
        'Young Justice - 3x02 - Royal We.mkv',
        'Young Sheldon - 2x12 - A Tummy Ache and a Whale of a Metaphor.mkv',
      ];
      cy.get('.app.enable--rename .renamable.is--previewing.is--selected', { timeout: DATA_SCRAPE_TIMEOUT }).each(($previewEl, ndx) => {
        const text = $previewEl.find('.renamable__new-name-text').text();
        expect(text).to.equal(newNames[ndx]);
        
        const navItems = $previewEl.find('.renamable__nav').children();
        expect(navItems[0].innerHTML.includes('xlink:href="#ui-icon_tmdb"')).to.be.true;
        expect(+navItems[1].textContent).to.be.a('number');
        expect(navItems[2].textContent).to.equal('View Series');
        expect(navItems[3].textContent).to.equal('Cache');
        expect(navItems[4].innerHTML.includes('xlink:href="#ui-icon_folder"')).to.be.true;
      });
      
      screenshot('.app', 'previewing new names');
      
      cy.get('@ITEMS_NAV__FOLDERS_BTN').click();
      cy.get('@ITEMS_NAV__RENAME_BTN').click();
      
      cy.get('.app__section:nth-child(2) .log-item__to', { timeout: IMG_SCRAPE_TIMEOUT }).each(($el, ndx) => {
        expect($el.text()).to.equal(`${ appConfig.output }/${ newNames[ndx] }`);
      });
      
      const deletedFolders = [
        '✔Deleted folder: "/media/files/src/Dirty.John.S01E01.720p.HDTV.x265"',
        '✔Deleted folder: "/media/files/src/Dirty.John.S01E02.720p.HDTV.x265"',
        '✔Deleted folder: "/media/files/src/MONEY HEIST SEASON (1-4)"',
        '✔Deleted folder: "/media/files/src/Psych.Season.1-8.720p.x265.HEVC-LION[UTR]"',
        '✔Deleted folder: "/media/files/src/Veep S01-S06 (1080p x265 10bit)"',
      ];
      cy.get('.app__section:nth-child(2) .log-item__deleted').each(($el, ndx) => {
        expect($el.text()).to.equal(deletedFolders[ndx]);
      });
      
      screenshot('.app', 'files renamed');
      
      cy.get('.app__logs-nav .toggle__btn').click();
    });
  });
  
  it('should allow for manual name adjustments', () => {
    loadPageWithItems([
      'big.fat.quiz',
      '"big fat quiz"',
      'doctor.who',
      'mob.psycho',
      'shameless',
      'sword.art.online',
      'tell.me.a.story',
      '"the legend of korra"',
    ]).then(() => {
      const names = [
        [
          'Big Fat Quiz Of The Year 2018 1080p h264 AAC',
          'the Big Fat Quiz Of The Year s01e15',
        ],
        [
          'big.fat.quiz.of.everything.2018.hdtv.x264',
          'the.big.fat.quiz.of.everything.s00e03',
        ],
        [
          'Doctor.Who.2005.S00E156.Resolution.New.Year.Special.720p.WEBRip.2CH.x265.HEVC',
          'Doctor.Who.(2005).S00E156',
        ],
        [
          'Mob.Psycho.100.II.07.1080p.WEBRip.x265.HEVC.10bit.AAC.2.0',
          'Mob.Psycho.100.s02e07',
        ],
        [
          'Shameless.US.S09E11.The.Hobo.Games.720p.WEBRip.2CH.x265.HEVC',
          'Shameless.(2011).S09E11',
        ],
        [
          'Sword.Art.Online.Alicization.19.1080p.WEBRip.x265.HEVC.10bit.AAC.2.0',
          'Sword.Art.Online.s03e19',
        ],
        [
          'Tell.Me.a.Story.US.S01E10.Chapter.10.Forgiveness.720p.WEBRip.2CH.x265.HEVC',
          'Tell.Me.a.Story.S01E10',
        ],
        [
          'The Legend of Korra (2012) S01E01 Welcome to Republic City',
          'The Legend of Korra S01E01',
        ],
      ];
      cy.get('.renamable__ce-fix [spellcheck="false"]').each(($el, ndx) => {
        for(let i=0; i<names.length; i++){
          const [oldName, newName] = names[i];
          if(oldName === $el.text()){
            cy.wrap($el).click({ force: true }).type(`{selectall}${ newName }`);
            break;
          }
        }
      });
      
      cy.get('@ITEMS_NAV__PREVIEW_BTN').click();
      
      const newNames = [
        'Big Fat Quiz - 1x15 - The Big Fat Quiz of the Year 2018.mkv',
        'The Big Fat Quiz of Everything - 0x03 - 2018 Special.mp4',
        'Doctor Who (2005) - 0x156 - Resolution.mkv',
        'Mob Psycho 100 - 2x07 - Cornered ~True Identity~.mkv',
        'Shameless (2011) - 9x11 - The Hobo Games.mkv',
        'Sword Art Online - 3x19 - The Seal of the Right Eye.mkv',
        'Tell Me a Story - 1x10 - Chapter 10- Forgiveness.mkv',
        'The Legend of Korra - 1x01 - Welcome to Republic City.mkv',
      ];
      cy.get('.app.enable--rename .renamable.is--previewing.is--selected .renamable__new-name-text', { timeout: DATA_SCRAPE_TIMEOUT }).each(($el, ndx) => {
        expect($el.text()).to.equal(newNames[ndx]);
      });
      
      screenshot('.app', 'previewing manually adjusted names');
      
      cy.get('@ITEMS_NAV__FOLDERS_BTN').click();
      cy.get('@ITEMS_NAV__RENAME_BTN').click();
      
      cy.get('.app__section:nth-child(2) .log-item__to', { timeout: IMG_SCRAPE_TIMEOUT }).each(($el, ndx) => {
        expect($el.text()).to.equal(`${ appConfig.output }/${ newNames[ndx] }`);
      });
      
      const deletedFolders = [
        '✔Deleted folder: "/media/files/src/Big.Fat.Quiz.Of.Everything.2018.HDTV.x264"',
        '✔Deleted folder: "/media/files/src/Sword.Art.Online.Alicization.19.1080p.WEBRip.x265.HEVC.10bit.AAC.2.0"',
      ];
      cy.get('.app__section:nth-child(2) .log-item__deleted').each(($el, ndx) => {
        expect($el.text()).to.equal(deletedFolders[ndx]);
      });
      
      screenshot('.app', 'files renamed');
      
      cy.get('.app__logs-nav .toggle__btn').click();
    });
  });
  
  describe('futurama', () => {
    before(() => {
      loadPageWithItems('futurama', {
        name: 'futurama',
        mapID: SERIES_ID__FUTURAMA,
      });
      cy.get('@ITEMS_NAV__TOGGLE_ALL').click();
    });
    
    beforeEach(() => {
      setUpAliases();
    });
    
    it('should request and cache actual data from the external API', () => {
      // NOTE - Using Futurama because:
      // - It has multiple seasons
      // - It has DVD ordering
      // - It has a Special season
      // - The series is over, so downloading the data shouldn't result in changes
      // to the checked-in file.
      toggleItem('Futurama S01E01');
      
      // preview item
      cy.get('@ITEMS_NAV__PREVIEW_BTN').click();
      
      // wait for preview to appear, verify preview text
      const newName = 'Futurama - 1x01 - Space Pilot 3000.mkv';
      cy.get('.app.enable--rename .renamable.is--previewing.is--selected .renamable__new-name-text', { timeout: DATA_SCRAPE_TIMEOUT }).each(($el) => {
        expect($el.text()).to.equal(newName);
      });
      
      screenshot('.app', 'new data scraped');
      
      // delete e01 item in newly created JSON
      cy.readFile(`${ E2E_FOLDER }/mnt/data/tmdb__cache/futurama.json`, 'utf8').then((data) => {
        data.seasons[1].episodes[1] = null;
        cy.writeFile(`${ E2E_FOLDER }/mnt/data/tmdb__cache/futurama.json`, JSON.stringify(data, null, 2), 'utf8');
      });
      
      // preview item again to get Cache button
      cy.get('@ITEMS_NAV__PREVIEW_BTN').click();
      
      screenshot('.app', 'cache update required');
      
      // click Cache button
      cy.get('.renamable__new-name-text', { timeout: DATA_SCRAPE_TIMEOUT }).contains('No Exact Match Found - Missing episode "1" data in cache.');
      cy.get('.is--refresh').contains('Cache').click();
      
      // wait for preview to appear
      cy.get('.app.enable--rename .renamable.is--previewing.is--selected .renamable__new-name-text').each(($el) => {
        expect($el.text()).to.equal(newName);
      });
      
      screenshot('.app', 'series episode found after cache update');
      
      cy.get('.renamable__nav-item.is--toggle .toggle__btn').click();
      cy.get('@ITEMS_NAV__RENAME_BTN').click();
      cy.get('.app__section:nth-child(2) .log-item__to', { timeout: IMG_SCRAPE_TIMEOUT }).each(($el, ndx) => {
        expect($el.text()).to.equal(`${ appConfig.output }/${ newName }`);
      });
      
      screenshot('.app', 'file renamed');
      
      cy.get('.app__logs-nav .toggle__btn').click();
    });
    
    it('should get name by DVD order, and put file in a series folder', () => {
      toggleItem('Futurama S01E12 When Aliens Attack');
      
      cy.get('.app__items-nav').contains(/^DVD Preview$/).click();
      
      const newName = 'Futurama - 1x12 - When Aliens Attack.mkv';
      cy.get('.app.enable--rename .renamable.is--previewing.is--selected .renamable__new-name-text')
        .contains(newName);
      
      screenshot('.app', 'previewing names by DVD order');
      
      cy.get('@ITEMS_NAV__RENAME_BTN').click();
      cy.get('.app__section:nth-child(2) .log-item__to', { timeout: IMG_SCRAPE_TIMEOUT }).each(($el, ndx) => {
        expect($el.text()).to.equal(`${ appConfig.output }/Futurama/Season 01/${ newName }`);
      });
      
      screenshot('.app', 'file renamed');
      
      cy.get('.app__logs-nav .toggle__btn').click();
    });
  });
  
  it('should allow a User to assign an ID for a series', () => {
    loadPageWithItems('high.maintenance', {
      name: 'high_maintenance.json',
      mapID: SERIES_ID__HIGH_MAINTENANCE,
      seriesID: SERIES_ID__HIGH_MAINTENANCE,
    }).then(() => {
      cy.get('@ITEMS_NAV__PREVIEW_BTN').click();
      cy.get('.renamable__new-name.has--warning .renamable__nav').contains('Assign').click();
      screenshot('.app', 'viewing assign modal');
      
      cy.get(`.assign-id__match[data-id="${ SERIES_ID__HIGH_MAINTENANCE }"]`).click();
      screenshot('.app', 'selected series from list');
      cy.get('.assign-id__assign-btn').click();
      
      const newNames = [
        ['High Maintenance (2016)/Season 03', 'High Maintenance (2016) - 3x02 - Craig.mkv'],
        ['High Maintenance/Season 01', 'High Maintenance - 1x08 - Jonathan.mkv'],
        ['High Maintenance/Season 01', 'High Maintenance - 1x09 - Elijah.mkv'],
      ];
      cy.get('#modals').should('be.empty');
      cy.get('.app.enable--rename .renamable.is--previewing.is--selected .renamable__new-name-text').each(($el, ndx) => {
        expect($el.text()).to.equal(newNames[ndx][1]);
      });
      
      screenshot('.app', 'previewing assigned series names');
      
      cy.get('@ITEMS_NAV__RENAME_BTN').click();
      cy.get('.app__section:nth-child(2) .log-item__to', { timeout: IMG_SCRAPE_TIMEOUT }).each(($el, ndx) => {
        expect($el.text()).to.equal(`${ appConfig.output }/${ newNames[ndx][0] }/${ newNames[ndx][1] }`);
      });
      
      screenshot('.app', 'files renamed');
      
      cy.get('.app__logs-nav .toggle__btn').click();
    });
  });
  
  // NOTE - Using Hunter X Hunter because:
  // - It has episode numbering based on the total episodes in the series.
  // - It has multiple seasons.
  // - It has multiple series listings.
  // - The series is over, so downloading the data shouldn't result in changes
  // to the checked-in file.
  describe('hunter x hunter', () => {
    const CACHE_NAME = 'hunter_x_hunter_(2011).json';
    
    before(() => {
      loadPageWithItems('hunter.x', {
        name: CACHE_NAME,
        mapID: SERIES_ID__HUNTER_X,
        seriesID: SERIES_ID__HUNTER_X,
      });
    });
    
    beforeEach(() => {
      setUpAliases();
    });
    
    it('should allow a User to Search for a series, and account for Anime numbering', () => {
      cy.get('@ITEMS_NAV__PREVIEW_BTN').click();
      cy.get('.renamable__new-name.has--warning .renamable__nav', { timeout: DATA_SCRAPE_TIMEOUT }).contains('Assign').click();
      cy.get('.assign-id__match').should(($divs) => {
        expect($divs.length > 2).to.equal(true);
      });
      
      screenshot('.app', 'viewing assign modal');
      
      cy.get('.assign-id__search-bar input').type('{selectall}hunter x hunter');
      cy.get('.assign-id__search-bar button').click();
      cy.get('.assign-id__match[data-name="Hunter x Hunter (2011)"]').click();
      cy.get('.assign-id__id-input').should('have.value', SERIES_ID__HUNTER_X);
      cy.get('.assign-id__help-text').contains(`Any matches for hunter x will use TMDB id ${ SERIES_ID__HUNTER_X } after you click Assign.`);
      
      screenshot('.app', 'series id picked');
      
      cy.get('.assign-id__assign-btn:not(:disabled)').click();
      cy.get('#modals').should('be.empty');
      
      const newName = 'Hunter x Hunter (2011) - 2x02 - (64) Strengthen x And x Threaten.mkv';
      cy.get('.app.enable--rename .renamable.is--previewing.is--selected .renamable__new-name-text').then(($el) => {
        expect($el.text()).to.equal(newName);
      });
      
      screenshot('.app', 'previewing Anime name with extra ep. data');
    });
    
    it('should maintain the series year on cache update', () => {
      const jsonPath = `${ E2E_FOLDER }/mnt/data/tmdb__cache/${ CACHE_NAME }`;
      cy.readFile(jsonPath, 'utf8').then((json) => {
        json.seasons['2'].episodes[2] = undefined;
        cy.writeFile(jsonPath, json, 'utf8');
      });
      
      cy.get('@ITEMS_NAV__PREVIEW_BTN').click();
      screenshot('.app', 'cache needs to update');
      
      cy.get('.is--refresh').contains('Cache').click();
      const epName = 'Hunter x Hunter (2011) - 2x02 - (64) Strengthen x And x Threaten.mkv';
      cy.get('.app.enable--rename .renamable.is--previewing.is--selected .renamable__new-name-text').then(($el) => {
        expect($el.text()).to.equal(epName);
      });
      screenshot('.app', 'series year remains');
      
      cy.get('@ITEMS_NAV__FOLDERS_BTN').click();
      cy.get('@ITEMS_NAV__RENAME_BTN').click();
      cy.get('.app__section:nth-child(2) .log-item__to', { timeout: IMG_SCRAPE_TIMEOUT }).each(($el, ndx) => {
        expect($el.text()).to.equal(`${ appConfig.output }/${ epName }`);
      });
      
      screenshot('.app', 'file renamed');
      
      cy.get('.app__logs-nav .toggle__btn').click();
    });
  });
  
  it('should display assignable results even when the series name does not match', () => {
    loadPageWithItems('"Mugen no Juunin"', {
      name: 'blade_of_the_immortal_(2019).json',
      mapID: SERIES_ID__BLADE_OF_THE_IMMORTAL,
      seriesID: SERIES_ID__BLADE_OF_THE_IMMORTAL,
    }).then(() => {
      cy.get('@ITEMS_NAV__PREVIEW_BTN').click();
      cy.get('.renamable__new-name.has--warning .renamable__nav', { timeout: DATA_SCRAPE_TIMEOUT }).contains('Assign').click();
      
      cy.get('.assign-id__match[data-name="Blade of the Immortal (2019)"]').click();
      cy.get('.assign-id__id-input').should('have.value', SERIES_ID__BLADE_OF_THE_IMMORTAL);
      
      screenshot('.app', 'series id picked');
      
      cy.get('.assign-id__assign-btn:not(:disabled)').click();
      cy.get('#modals').should('be.empty');
      
      const newName = 'Blade of the Immortal (2019) - 1x01 - Act One - Meeting.mkv';
      cy.get('.app.enable--rename .renamable.is--previewing.is--selected .renamable__new-name-text').then(($el) => {
        expect($el.text()).to.equal(newName);
      });
      
      screenshot('.app', 'previewing Anime name with extra ep. data');
      
      cy.get('@ITEMS_NAV__RENAME_BTN').click();
      
      screenshot('.app', 'file renamed');
      
      cy.get('.app__logs-nav .toggle__btn').click();
    });
  });
  
  it('should allow for Search & Replace of file names on the file system', () => {
    loadPageWithItems('"my name is earl"').then(() => {  
      cy.get('@ITEMS_NAV__REPLACE_BTN')
        .should('not.be.disabled')
        .click();
        
      screenshot('.app', 'replace modal opened');
      
      const rowData = [
        ['1x02.quit.smoking.mkv', '1x02.quit.smoking.mkv', `${ appConfig.source }/My Name is Earl S01-S04 Season 1-4/My Name Is Earl S01 Season 1`],
        ['2x01.very.bad.things.mkv', '2x01.very.bad.things.mkv', `${ appConfig.source }/My Name is Earl S01-S04 Season 1-4/My Name Is Earl S02 Season 2`],
        ['earl.1x01.pilot.mkv', 'earl.1x01.pilot.mkv', `${ appConfig.source }/My Name is Earl S01-S04 Season 1-4/My Name Is Earl S01 Season 1`],
      ];
      cy.get('.replace__table-body .replace__table-row').each(($tr, rowNdx) => {
        cy.wrap($tr).as('tr');
        
        cy.get('@tr').should('have.attr', 'data-dir', rowData[rowNdx][2]);
        cy.get('@tr').within(() => {
          cy.get('.replace__table-data').each(($td, tdNdx) => {
            expect($td.text()).to.equal(rowData[rowNdx][tdNdx]);
          });
        });
      });
      
      cy.get('.replace__labeled-input:nth-of-type(1) input').as('MATCH_INPUT');
      cy.get('.replace__labeled-input:nth-of-type(1) button').as('PATTERN_BTN');
      cy.get('@MATCH_INPUT').type('(.*)?(\\d{{}1{}})x'); // `{{}` and `{}}` is Cypress' way of typing `{}`
      cy.get('@PATTERN_BTN').click();
      
      cy.get('.replace__labeled-input:nth-of-type(2) input').as('REPLACE_INPUT');
      cy.get('.replace__labeled-input:nth-of-type(2) button[data-token="$2"]').as('GROUP2_BTN');
      cy.get('.replace__labeled-input:nth-of-type(2) button[data-token="$3"]').as('GROUP3_BTN');
      cy.get('@REPLACE_INPUT').type('My.Name.is.Earl.s0');
      cy.get('@GROUP2_BTN').click();
      cy.get('@REPLACE_INPUT').type('e');
      cy.get('@GROUP3_BTN').click();
      
      cy.get('.replace__table-body .replace__table-row').each(($tr, rowNdx) => {
        const rowData = [
          ['1x02', 'My.Name.is.Earl.s01e02.quit.smoking'],
          ['2x01', 'My.Name.is.Earl.s02e01.very.bad.things'],
          ['earl.1x01', 'My.Name.is.Earl.s01e01.pilot'],
        ];
        
        cy.wrap($tr).within(() => {
          cy.get('.replace__table-data > mark').each(($mark, tdNdx) => {
            expect($mark.text()).to.equal(rowData[rowNdx][tdNdx]);
          });
        });
      });
      
      screenshot('.app', 'replace names preview');
      
      cy.get('.replace__btm-nav button')
        .contains('Rename')
        .click();
      
      cy.get('#modals').should('be.empty');
      cy.get('.app.is--visible');
      setUpAliases();
      
      cy.get('@ITEMS_NAV__PREVIEW_BTN').click();
      
      screenshot('.app', 'previewing files with replaced names');
      
      cy.get('@ITEMS_NAV__RENAME_BTN', { timeout: DATA_SCRAPE_TIMEOUT }).click();
      
      const logs = [
        `${ appConfig.output }/My Name Is Earl/Season 01/My Name Is Earl - 1x01 - Pilot.mkv`,
        `${ appConfig.output }/My Name Is Earl/Season 01/My Name Is Earl - 1x02 - Quit Smoking.mkv`,
        `${ appConfig.output }/My Name Is Earl/Season 02/My Name Is Earl - 2x01 - Very Bad Things.mkv`,
        `✔Deleted folder: "${ appConfig.source }/My Name is Earl S01-S04 Season 1-4"`,
      ];
      cy.get('.app__section:nth-child(2) .log-item__to', { timeout: IMG_SCRAPE_TIMEOUT }).each(($log, logNdx) => {
        const logMsg = logs[logNdx];
        expect($log.text()).to.equal(logMsg);
      });
      
      screenshot('.app', 'files renamed');
    });
  });
  
  it('should NOT fail while replacing a filename that has bad characters in it', () => {
    loadPageWithItems('gintama').then(() => {
      cy.get('@ITEMS_NAV__REPLACE_BTN')
        .should('not.be.disabled')
        .click();
        
      screenshot('.app', 'replace modal opened');
      
      cy.get('.replace__labeled-input:nth-of-type(1) input').as('MATCH_INPUT');
      // cy.get('.replace__labeled-input:nth-of-type(1) .input-wrapper button').as('CLEAR_BTN');
      cy.get('.replace__labeled-input:nth-of-type(1) button').as('PATTERN_BTN');
      // cy.get('@CLEAR_BTN').click();
      cy.get('@MATCH_INPUT').type('(\\d{{}1{}})x'); // `{{}` and `{}}` is Cypress' way of typing `{}`
      cy.get('@PATTERN_BTN').click();
      
      cy.get('.replace__labeled-input:nth-of-type(2) input').as('REPLACE_INPUT');
      cy.get('.replace__labeled-input:nth-of-type(2) button[data-token="$1"]').as('GROUP1_BTN');
      cy.get('.replace__labeled-input:nth-of-type(2) button[data-token="$2"]').as('GROUP2_BTN');
      cy.get('@REPLACE_INPUT').type('s0');
      cy.get('@GROUP1_BTN').click();
      cy.get('@REPLACE_INPUT').type('e');
      cy.get('@GROUP2_BTN').click();
      
      cy.get('.replace__table-body .replace__table-row').each(($tr, rowNdx) => {
        const rowData = [
          ['1x46', 'Gintama - s01e46 - Adults Only – We Wouldn’t Want “Anyone Immature in Here'],
        ];
        
        cy.wrap($tr).within(() => {
          cy.get('.replace__table-data > mark').each(($mark, tdNdx) => {
            expect($mark.text()).to.equal(rowData[rowNdx][tdNdx]);
          });
        });
      });
      
      screenshot('.app', 'replace names preview');
      
      cy.get('.replace__btm-nav button')
        .contains('Rename')
        .click();
      
      cy.get('#modals').should('be.empty');
      cy.get('.app.is--visible');
      setUpAliases();
      
      cy.get('@ITEMS_NAV__PREVIEW_BTN').click();
      
      screenshot('.app', 'previewing files with replaced names');
      
      cy.get('@ITEMS_NAV__RENAME_BTN', { timeout: DATA_SCRAPE_TIMEOUT }).click();
      
      cy.get('.app__section:nth-child(2) .log-item__to', { timeout: IMG_SCRAPE_TIMEOUT });
      
      screenshot('.app', 'files renamed');
    });
  });
});
