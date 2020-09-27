context('Renamer', () => {
  const acceptedExts = ['avi', 'mkv', 'mp4'];
  const appConfig = {};
  let fileNames;
  
  let screenshotNdx = 0;
  function screenshot(selector, name) {
    const pad = (num, token='00') => token.substring(0, token.length-`${ num }`.length) + num;
    screenshotNdx++;
    cy.get(selector).screenshot(`${ pad(screenshotNdx) }__${ name.replace(/\s/g, '-') }`);
  }
  
  function loadPage() {
    cy.exec('node /mockData/genFiles.js');
    
    cy.readFile('/mockData/files.txt', 'utf8').then((names) => {
      fileNames = names
        .split('\n')
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
    
    cy.visit('/');
  }
  
  function toggleItem(name) {
    cy.get('.renamable__ce-fix [spellcheck="false"]')
      .contains(name)
      .closest('.renamable')
      .find('> .toggle')
      .click();
  }
  
  const nameSort = (a, b) => {
    const subCheck = (b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0;
    return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : subCheck;
  };
  
  before(() => {
    loadPage();
    cy.get('.app.is--visible');
    
    cy.get('.app__nav').contains(/Config$/).click();
    cy.get('input[name="sourceFolder"]').then(el => { appConfig.source = el.val(); });
    cy.get('input[name="outputFolder"]').then(el => { appConfig.output = el.val(); });
    screenshot('.app', 'config opened');
    cy.get('.config__close-btn').click();
  });
  
  beforeEach(() => {
    cy.get('.app__items-nav button[for="folders"]').as('ITEMS_NAV__FOLDERS_BTN');
    cy.get('.app__items-nav button[for="preview"]').as('ITEMS_NAV__PREVIEW_BTN');
    cy.get('.app__items-nav button[for="rename"]').as('ITEMS_NAV__RENAME_BTN');
  });

  it('should have the correct title', () => {
    cy.get('title').contains('TV Renamer');
  });
  
  it('should have loaded files to rename', () => {
    expect(fileNames.length).to.eq(81);
    
    cy.get('.renamable__ce-fix [contenteditable="true"][spellcheck="false"]')
      .each(($el, ndx) => {
        expect($el.text()).to.equal(fileNames[ndx].name);
      });
    
    screenshot('.app', 'files loaded');
  });
  
  it('should preview and rename files with exact matches', () => {
    // disable anything I don't want to preview
    toggleItem('[REL] Kanojo, Okarishimasu - S01E12');
    
    cy.get('@ITEMS_NAV__PREVIEW_BTN').click();
    
    // generate list with `[...document.querySelectorAll('.renamable.is--previewing.is--selected .renamable__new-name-text')].map(el => { const t = el.textContent; const q = t.includes("'") ? '"' : "'"; return `${q}${t}${q},`}).join('\n');`
    const newNames = [
      'My Hero Academia - 4x11 - Lemillion.mkv',
      'Appare-Ranman! - 1x10 - The Bridge to Hell.mkv',
      'Astra Lost in Space - 1x01 - Planet Camp.mkv',
      'Barry - 2x08 - berkman (greater-than) block.mkv',
      'Black Monday - 1x01 - 365.mkv',
      'Black Monday - 1x02 - 364.mkv',
      'Blue Bloods - 9x11 - Disrupted.mkv',
      "Bob's Burgers - 9x11 - Lorenzo's Oil No, Linda's.mkv",
      'Bravest Warriors - 4x05x06 - From the Inside Room & All I Wish is to Be Alone.mp4',
      'Brooklyn Nine-Nine - 6x01 - Honeymoon.mkv',
      'Carole & Tuesday - 1x02 - Born to Run.mkv',
      'Carole & Tuesday - 1x01 - True Colors.mkv',
      'Counterpart - 2x05 - Shadow Puppets.mkv',
      'Crashing (2017) - 3x01 - Jaboukie.mkv',
      'Deadly Class - 1x02 - Noise, Noise, Noise.mkv',
      'Dirty John - 1x01 - Approachable Dreams.mkv',
      'Dirty John - 1x02 - Red Flags and Parades.mkv',
      'Doctor Who (2005) - 0x156 - Resolution.mkv',
      'Doom Patrol - 1x01 - Pilot.mkv',
      'Forged in Fire - 6x01x02 - Long Road to Redemption.mkv',
      'Futurama - 1x01 - Space Pilot 3000.mkv',
      'Future Man - 2x05 - J1- Judgment Day.mkv',
      'Game of Thrones - 0x41 - The Last Watch.mkv',
      'gen-LOCK - 1x01 - The Pilot.mkv',
      'High Maintenance (2016) - 3x02 - Craig.mkv',
      'High Maintenance (2016) - 3x01 - M.A.S.H..mkv',
      'Hyperdrive (2019) - 1x01 - Qualifier 1- Ready to Launch.mkv',
      'Hyperdrive - 1x01 - A Gift from the Glish.mkv',
      'I Am the Night - 1x01 - Pilot.mkv',
      'I Am the Night - 1x03 - Dark Flower.mkv',
      'Astra Lost in Space - 1x06 - Secret.mkv',
      'Demon Slayer- Kimetsu no Yaiba - 1x02 - Trainer Sakonji Urokodaki.mkv',
      'Money Heist - 1x02 - Lethal Negligence.mkv',
      'Loudermilk - 2x03 - All Apologies .mp4',
      'Luther - 5x03 - Episode 3.mkv',
      "Marvel's The Punisher - 2x01 - Roadhouse Blues.mkv",
      'Project Blue Book - 1x01 - The Fuller Dogfight.mkv',
      'Psych - 2x01 - American Duos.mkv',
      'Psych - 2x02 - 65 Million Years Off.mkv',
      'Psych - 3x01 - Ghosts.mkv',
      'Ray Donovan - 6x11 - Never Gonna Give You Up.mkv',
      'Russian Doll - 1x01 - Nothing in This World Is Easy.mkv',
      'SEAL Team - 3x11x12 - Siege Protocol.mkv',
      'Sex Education - 1x02 - House Party.mkv',
      'Shameless (US) - 9x11 - The Hobo Games.mkv',
      "SMILF - 2x02 - Sorry Mary, I'm Losing Faith.mkv",
      "Speechless - 3x09 - J-A-- JAVIER'S P-A-- PANTS.mkv",
      'Star Trek- Discovery - 2x01 - Brother.mkv',
      'Stargate SG-1 - 1x01x02 - Children of the Gods.mkv',
      'Suits - 8x12 - Whale Hunt.mkv',
      'Supernatural - 14x10 - Nihilism.mkv',
      'Supernatural - 14x15 - Peace of Mind.mkv',
      'Tell Me a Story (US) - 1x10 - Chapter 10- Forgiveness.mkv',
      'The Blacklist - 6x02 - The Corsican.mkv',
      'The Dragon Prince - 2x03 - Smoke and Mirrors.mkv',
      'The Good Doctor - 2x11 - Quarantine Part Two.mkv',
      'The Good Place - 3x10 - The Book of Dougs.mkv',
      'The Last O.G. - 3x04 - They Reminisce Over You.mkv',
      'The Magicians (2015) - 4x01 - A Flock of Lost Birds.mkv',
      'The Orville - 2x03 - Home.mkv',
      'The Rookie - 1x09 - Standoff.mkv',
      'The Umbrella Academy - 1x02 - Run Boy Run .mkv',
      'True Detective - 3x01 - The Great War and Modern Memory.mkv',
      'Veep - 1x01 - Fundraiser.mkv',
      'Veep - 2x08 - First Response.mkv',
      'Veep - 2x09 - Running.mkv',
      'Vikings - 5x17 - The Most Terrible Thing.mkv',
      'Wayne - 1x03 - The Goddamned Beacon of Truth.mkv',
      "You're the Worst - 5x01 - The Intransigence of Love.mkv",
      'Young Justice - 3x02 - Royal We.mkv',
      'Young Sheldon - 2x12 - A Tummy Ache and a Whale of a Metaphor.mkv',
    ];
    cy.get('.app.enable--rename .renamable.is--previewing.is--selected').each(($previewEl, ndx) => {
      expect($previewEl.find('.renamable__new-name-text').text()).to.equal(newNames[ndx]);
      expect($previewEl.find('.renamable__nav').children().length).to.equal(4);
    });
    
    screenshot('.app', 'previewing new names');
    
    cy.get('@ITEMS_NAV__RENAME_BTN').click();
    
    cy.get('.app__section:nth-child(2) .log-item__to').each(($el, ndx) => {
      expect($el.text()).to.equal(`${ appConfig.output }/${ newNames[ndx] }`);
    });
    
    screenshot('.app', 'files renamed');
    
    cy.get('.app__logs-nav .toggle__btn').click();
  });
  
  it('should allow for manual name adjustments', () => {
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
        'Mob.Psycho.100.II.07.1080p.WEBRip.x265.HEVC.10bit.AAC.2.0',
        'Mob.Psycho.100.s02e07',
      ],
      [
        'Sword.Art.Online.Alicization.19.1080p.WEBRip.x265.HEVC.10bit.AAC.2.0',
        'Sword.Art.Online.s03e19',
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
      'The Big Fat Quiz of the Year - 1x15 - The Big Fat Quiz of the Year 2018.mkv',
      'The Big Fat Quiz of Everything - 0x03 - 2018 Special.mp4',
      'Mob Psycho 100 - 2x07 - Cornered ~True Identity~.mkv',
      'Sword Art Online - 3x19 - The Seal of the Right Eye.mkv',
      'The Legend of Korra - 1x01 - Welcome to Republic City.mkv',
    ];
    cy.get('.app.enable--rename .renamable.is--previewing.is--selected .renamable__new-name-text').each(($el, ndx) => {
      expect($el.text()).to.equal(newNames[ndx]);
    });
    
    screenshot('.app', 'previewing manually adjusted names');
    
    cy.get('.app__items-nav').contains(/^Rename Selected/).click();
    
    cy.get('.app__section:nth-child(2) .log-item__to').each(($el, ndx) => {
      expect($el.text()).to.equal(`${ appConfig.output }/${ newNames[ndx] }`);
    });
    
    screenshot('.app', 'files renamed');
    
    cy.get('.app__logs-nav .toggle__btn').click();
  });
  
  it('should get name by DVD order, and put file in a series folder', () => {
    toggleItem('Futurama S01E12 When Aliens Attack');
    
    cy.get('.app__items-nav').contains(/^DVD Preview$/).click();
    
    const newName = 'Futurama - 1x12 - When Aliens Attack.mkv';
    cy.get('.app.enable--rename .renamable.is--previewing.is--selected .renamable__new-name-text')
      .contains(newName);
    
    cy.get('@ITEMS_NAV__FOLDERS_BTN').click();
    
    screenshot('.app', 'previewing names by DVD order');
    
    cy.get('.app__items-nav').contains(/^Rename Selected/).click();
    cy.get('.app__section:nth-child(2) .log-item__to').each(($el, ndx) => {
      expect($el.text()).to.equal(`${ appConfig.output }/Futurama/${ newName }`);
    });
    
    screenshot('.app', 'file renamed');
    
    cy.get('.app__logs-nav .toggle__btn').click();
  });
  
  it('should allow a User to search for and assign an ID for a series', () => {
    const SERIES_ID = 380654;
    
    toggleItem('[REL] Kanojo, Okarishimasu - S01E12');
    
    cy.server();
    cy.route({
      method: 'POST',
      url: '/api/v1/preview',
      response: [{
        error: 'Possible series mis-match',
        id: SERIES_ID,
        index: '3',
        name: 'Rent-a-Girlfriend',
        seriesURL: 'https://www.thetvdb.com/series/rental-girlfriend',
      }],
    }).as('RESPONSE__POSSIBLE_MISMATCH');
    cy.get('@ITEMS_NAV__PREVIEW_BTN').click();
    cy.wait('@RESPONSE__POSSIBLE_MISMATCH');
    cy.server({ enable: false });
    
    cy.get('.renamable__nav').contains(SERIES_ID).click();
    
    screenshot('.app', 'viewing assign modal');
    
    cy.get('.assign-id__search-link').then(($el) => {
      cy.wrap($el)
        .should('have.attr', 'href', 'https://www.thetvdb.com/search?query=kanojo%2C%20okarishimasu')
        .should('have.attr', 'rel', 'noopener noreferrer')
        .should('have.attr', 'target', '_blank');
    });
    
    cy.get('.assign-id__confirm-btn').click();
    
    const newName = 'Rent-a-Girlfriend - 1x12 - Confession and Girlfriend.mkv';
    cy.get('#modals').should('be.empty');
    cy.get('.app.enable--rename .renamable.is--previewing.is--selected .renamable__new-name-text')
      .contains(newName);
    
    screenshot('.app', 'previewing assigned series name');
    
    cy.get('.app__items-nav').contains(/^Rename Selected/).click();
    
    screenshot('.app', 'file renamed');
    
    cy.get('.app__section:nth-child(2) .log-item__to').each(($el, ndx) => {
      expect($el.text()).to.equal(`${ appConfig.output }/${ newName }`);
    });
  });
  
  it('should allow for Search & Replace of file names on the file system', () => {
    cy.get('button[for="replace"]')
      .should('be.disabled')
      .as('REPLACE_BTN');
    
    cy.get('.app__global-toggle .toggle__btn').click();
    
    cy.get('@REPLACE_BTN')
      .should('not.be.disabled')
      .click();
      
    screenshot('.app', 'replace modal opened');
    
    cy.get('.replace__table-body .replace__table-row').each(($tr, rowNdx) => {
      const rowData = [
        ['1x01.mkv', '1x01.mkv'],
        ['1x02.mkv', '1x02.mkv'],
        ['2x01.mkv', '2x01.mkv'],
      ];
      
      cy.wrap($tr).within(() => {
        cy.get('.replace__table-data').each(($td, tdNdx) => {
          expect($td.text()).to.equal(rowData[rowNdx][tdNdx]);
        });
      });
    });
    
    cy.get('.replace__labeled-input input').each(($el, ndx) => {
      const values = ['(\\d)x(\\d+)', 'My.Name.is.Earl.s0$1e$2'];
      cy.wrap($el).type(values[ndx]);
      // wait for the debounce logic to kick in
      cy.get(`.replace__table-body .replace__table-row:nth-child(1) .replace__table-data:nth-child(${ ndx + 1 }) mark`);
    });
    
    cy.get('.replace__table-body .replace__table-row').each(($tr, rowNdx) => {
      const rowData = [
        ['1x01', 'My.Name.is.Earl.s01e01'],
        ['1x02', 'My.Name.is.Earl.s01e02'],
        ['2x01', 'My.Name.is.Earl.s02e01'],
      ];
      
      cy.wrap($tr).within(() => {
        cy.get('.replace__table-data mark').each(($mark, tdNdx) => {
          expect($mark.text()).to.equal(rowData[rowNdx][tdNdx]);
        });
      });
    });
    
    screenshot('.app', 'replace names preview');
    
    cy.get('.replace__btm-nav button')
      .contains('Rename')
      .click();
      
    cy.get('.app.is--visible');
    
    cy.get('@ITEMS_NAV__PREVIEW_BTN').click();
    
    screenshot('.app', 'previewing files with replaced names');
    
    cy.get('.app__items-nav').contains(/^Rename All/).click();
    
    cy.get('.log-item__body').each(($log, logNdx) => {
      const folderDeleteMsg = '✓Deleted folder: "/home/node/app/_temp_/src/My Name is Earl S01-S04 Season 1-4"';
      const logs = [
        '/home/node/app/_temp_/output/My Name Is Earl - 1x01 - Pilot.mkv',
        '/home/node/app/_temp_/output/My Name Is Earl - 1x02 - Quit Smoking.mkv',
        '/home/node/app/_temp_/output/My Name Is Earl - 2x01 - Very Bad Things.mkv',
      ];
      const logMsg = logs[logNdx];
      const $logMsg = $log.find('.log-item__to');
      const $folderDeletionMsg = $log.find('.log-item__deleted');
      
      expect($logMsg.text()).to.equal(logMsg);
      
      if($folderDeletionMsg.length){
        expect($folderDeletionMsg.text()).to.equal(folderDeleteMsg);
      }
    });
    
    screenshot('.app', 'files renamed');
  });
});
