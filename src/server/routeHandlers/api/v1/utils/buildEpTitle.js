export default function buildEpTitle(seasons, season, episodes) {
  const epNames = [];
  
  episodes.forEach((ndx) => {
    const epName = seasons[season].episodes[ndx].title;
    
    if (epName) {
      if (episodes.length > 1) {
        const parsedName = epName
          // Multi-part episodes can end with `(1), Part 1, etc`. Those items need
          // to be removed so a comparison can be made to see if the titles are
          // equal.
          .replace(/\s(?:\(\d+\)|Part \d+)$/i, '');
        
        // Only add the name if it doesn't already exist.
        if (epNames.indexOf(parsedName) < 0) epNames.push(parsedName);
      }
      else epNames.push(epName);
    }
  });
  
  return epNames.join(' & ');
}
