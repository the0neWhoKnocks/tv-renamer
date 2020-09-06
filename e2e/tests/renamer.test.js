context('Renamer', () => {
  function loadPage() { cy.visit('/'); }
  const nameSort = (a, b) => {
    const subCheck = (b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0;
    return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : subCheck;
  };
  
  before(() => {
    loadPage();
  });

  it('should have the correct title', () => {
    cy.get('title').contains('TV Renamer');
  });
  
  it('should have loaded', () => {
    cy.readFile('/mockData/files.txt', 'utf8')
      .then((names) => {
        const acceptedExts = ['avi', 'mkv', 'mp4'];
        const fileNames = names
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
        
        cy.get('.app.is--visible').then(() => {
          expect(fileNames.length).to.eq(76);
          
          cy.get('.renamable__ce-fix [contenteditable="true"][spellcheck="false"]')
            .each(($el, ndx, $list) => {
              expect($el.text()).to.eq(fileNames[ndx].name);
            });
        });
      });
  });
});
