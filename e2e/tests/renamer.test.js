context('Renamer', () => {
  const acceptedExts = ['avi', 'mkv', 'mp4'];
  let fileNames;
  
  function loadPage() {
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
  });

  it('should have the correct title', () => {
    cy.get('title').contains('TV Renamer');
  });
  
  it('should have loaded files to rename', () => {
    expect(fileNames.length).to.eq(76);
    
    cy.get('.renamable__ce-fix [contenteditable="true"][spellcheck="false"]')
      .each(($el, ndx, $list) => {
        expect($el.text()).to.eq(fileNames[ndx].name);
      });
  });
  
  it('should preview files', () => {
    cy.contains(/^Preview$/).click();
    cy.get('.app.enable--rename');
    
    // generate list with `[...document.querySelectorAll('.renamable.is--previewing.is--selected .renamable__new-name-text')].map(el => { const t = el.textContent; const q = t.includes("'") ? '"' : "'"; return `${q}${t}${q},`}).join('\n');`
    const newNames = [
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
      'Doom Patrol - 1x01 - Pilot.mkv',
      'Forged in Fire - 6x01x02 - Long Road to Redemption.mkv',
      'Future Man - 2x05 - J1- Judgment Day.mkv',
      'Game of Thrones - 0x41 - The Last Watch.mkv',
      'gen-LOCK - 1x01 - The Pilot.mkv',
      'High Maintenance (2016) - 3x02 - Craig.mkv',
      'High Maintenance (2016) - 3x01 - M.A.S.H..mkv',
      'Hyperdrive (2019) - 1x01 - Qualifier 1- Ready to Launch.mkv',
      'I Am the Night - 1x01 - Pilot.mkv',
      'I Am the Night - 1x03 - Dark Flower.mkv',
      'Demon Slayer- Kimetsu no Yaiba - 1x02 - Trainer Sakonji Urokodaki.mkv',
      'Loudermilk - 2x03 - All Apologies .mp4',
      'Luther - 5x03 - Episode 3.mkv',
      "Marvel's The Punisher - 2x01 - Roadhouse Blues.mkv",
      'Project Blue Book - 1x01 - The Fuller Dogfight.mkv',
      'Ray Donovan - 6x11 - Never Gonna Give You Up.mkv',
      'Russian Doll - 1x01 - Nothing in This World Is Easy.mkv',
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
    const names = [];
    cy.get('.renamable.is--previewing.is--selected .renamable__new-name-text').each(($el, ndx) => {
      // NOTE - running an `expect` in here causes a lot of network traffic and tests to behave inconsistently
      names.push($el.text());
    });
    names.forEach((name, ndx) => {
      expect(name).to.eq(newNames[ndx]);
    });
  });
});
