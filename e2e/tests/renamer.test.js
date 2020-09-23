context('Renamer', () => {
  const acceptedExts = ['avi', 'mkv', 'mp4'];
  const appConfig = {};
  let fileNames;
  
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
    cy.get('.config__close-btn').click();
  });

  it('should have the correct title', () => {
    cy.get('title').contains('TV Renamer');
  });
  
  it('should have loaded files to rename', () => {
    expect(fileNames.length).to.eq(80);
    
    cy.get('.renamable__ce-fix [contenteditable="true"][spellcheck="false"]')
      .each(($el, ndx, $list) => {
        expect($el.text()).to.eq(fileNames[ndx].name);
      });
  });
  
  it('should preview and rename files with exact matches', () => {
    cy.get('.app__items-nav').contains(/^Preview$/).click();
    
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
    cy.get('.app.enable--rename .renamable.is--previewing.is--selected .renamable__new-name-text').each(($el, ndx) => {
      expect($el).to.have.text(newNames[ndx]);
    });
    
    cy.get('[for="rename"]').contains(/^Rename Selected/).click();
    
    cy.get('.app__section:nth-child(2) .log-item__to').each(($el, ndx) => {
      expect($el).to.have.text(`${ appConfig.output }/${ newNames[ndx] }`);
    });
    
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
    
    cy.get('.app__items-nav').contains(/^Preview$/).click();
    
    const newNames = [
      'The Big Fat Quiz of the Year - 1x15 - The Big Fat Quiz of the Year 2018.mkv',
      'The Big Fat Quiz of Everything - 0x03 - 2018 Special.mp4',
      'Mob Psycho 100 - 2x07 - Cornered ~True Identity~.mkv',
      'Sword Art Online - 3x19 - The Seal of the Right Eye.mkv',
      'The Legend of Korra - 1x01 - Welcome to Republic City.mkv',
    ];
    cy.get('.app.enable--rename .renamable.is--previewing.is--selected .renamable__new-name-text').each(($el, ndx) => {
      expect($el).to.have.text(newNames[ndx]);
    });
    
    cy.get('.app__items-nav').contains(/^Rename Selected/).click();
    
    cy.get('.app__section:nth-child(2) .log-item__to').each(($el, ndx) => {
      expect($el).to.have.text(`${ appConfig.output }/${ newNames[ndx] }`);
    });
    
    cy.get('.app__logs-nav .toggle__btn').click();
  });
  
  it('should get name by DVD order, and put file in a series folder', () => {
    cy.get('.renamable__ce-fix [spellcheck="false"]')
      .contains('Futurama S01E12 When Aliens Attack')
      .closest('.renamable')
      .find('> .toggle')
      .click();
    
    cy.get('.app__items-nav').contains(/^DVD Preview$/).click();
    
    const newName = 'Futurama - 1x12 - When Aliens Attack.mkv';
    cy.get('.app.enable--rename .renamable.is--previewing.is--selected .renamable__new-name-text').each(($el, ndx) => {
      expect($el).to.have.text(newName);
    });
    
    cy.get('[for="folders"]').click();
    
    cy.get('.app__items-nav').contains(/^Rename Selected/).click();
    
    cy.get('.app__section:nth-child(2) .log-item__to').each(($el, ndx) => {
      expect($el).to.have.text(`${ appConfig.output }/Futurama/${ newName }`);
    });
  });
  
  it('should allow for Search & Replace of file names on the file system', () => {
    cy.get('button[for="replace"]')
      .contains('Replace')
      .should('be.disabled');
    
    cy.get('.app__global-toggle .toggle__btn').click();
    
    cy.get('button[for="replace"]')
      .should('not.be.disabled')
      .click();
    
    let rowData = [
      ['1x01.mkv', '1x01.mkv'],
      ['1x02.mkv', '1x02.mkv'],
      ['2x01.mkv', '2x01.mkv'],
    ];
    cy.get('.replace__table tbody tr').each(($tr, rowNdx) => {
      cy.wrap($tr).within(() => {
        cy.get('td').each(($td, tdNdx) => {
          expect($td).to.have.text(rowData[rowNdx][tdNdx]);
        });
      });
    });
    
    const INPUT_DEBOUNCE = 400;
    const inputsPromise = new Cypress.Promise((resolve) => {
      const values = ['(\\d)x(\\d+)', 'My.Name.is.Earl.s0$1e$2'];
      cy.get('.replace__labeled-input input').each(($el, ndx) => {
        setTimeout(function fn() {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          
          setter.call($el[0], values[ndx]);
          $el[0].dispatchEvent(new Event('input', { bubbles: true }));
          
          if(ndx === values.length - 1) {
            setTimeout(() => { resolve(); }, INPUT_DEBOUNCE);
          }
        }, INPUT_DEBOUNCE * ndx);
      });
    });
    
    inputsPromise.then(() => {
      rowData = [
        ['1x01.mkv', 'My.Name.is.Earl.s01e01.mkv'],
        ['1x02.mkv', 'My.Name.is.Earl.s01e02.mkv'],
        ['2x01.mkv', 'My.Name.is.Earl.s02e01.mkv'],
      ];
      cy.get('.replace__table tbody tr').each(($tr, rowNdx) => {
        cy.wrap($tr).within(() => {
          cy.get('td').each(($td, tdNdx) => {
            expect($td).to.have.text(rowData[rowNdx][tdNdx]);
          });
        });
      });
      
      cy.get('.replace__btm-nav button')
        .contains('Rename')
        .click();
      
      cy.get('.app__items-nav').contains(/^Preview$/).click();
      
      cy.get('.app__items-nav').contains(/^Rename All/).click();
      
      const folderDeleteMsg = 'Deleted folder: "/home/node/app/_temp_/src/My Name is Earl S01-S04 Season 1-4"';
      const logs = [
        '/home/node/app/_temp_/output/My Name Is Earl - 1x01 - Pilot.mkv',
        '/home/node/app/_temp_/output/My Name Is Earl - 1x02 - Quit Smoking.mkv',
        '/home/node/app/_temp_/output/My Name Is Earl - 2x01 - Very Bad Things.mkv',
      ];
      cy.get('.log-item__body').each(($log, logNdx) => {
        const logMsg = logs[logNdx];
        
        cy.wrap($log).within(() => {
          const $logMsg = $log.find('.log-item__to');
          const $folderDeletionMsg = $log.find('.log-item__deleted');
          
          cy.wrap($logMsg).contains(logMsg);
          
          if($folderDeletionMsg.length){
            cy.wrap($folderDeletionMsg).contains(folderDeleteMsg);
          }
        });
      });
    });
  });
});
