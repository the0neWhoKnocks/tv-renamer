import convertNameToSlug from './convertNameToSlug';
import getSeriesId from './getSeriesId';
import lookUpEpisodes from './lookUpEpisodes';

export default ({ cache, jwt, seriesName: userSeriesName }) => new Promise(
  (resolve, reject) => {
    if(cache[userSeriesName]){
      console.log(`Skipping series look-up for: "${ userSeriesName }"`);
      resolve(cache[userSeriesName]);
    }
    else{
      console.log(`Looking up series: "${ userSeriesName }"`);
      
      getSeriesId({ jwt, name: userSeriesName })
        .then(({ data: seriesMatches }) => {
          const unmatched = [];
          let epOpts, matchErr;
          
          for(let i=0; i<seriesMatches.length; i++){
            const { id, seriesName, slug } = seriesMatches[i];
            const slugName = convertNameToSlug(userSeriesName);
            
            if(
              // first try an exact name match
              userSeriesName === seriesName
              // then try by slug (only if there's NOT more than one)
              || (seriesMatches.length === 1 && slugName === slug)
            ){
              epOpts = {
                jwt,
                seriesID: id,
                seriesName,
                seriesSlug: slug,
              };
              break;
            }
            else{
              unmatched.push({ id, seriesName, slug });
            }
          }
          
          if(!epOpts) matchErr = {
            err: `No matches from: ${ JSON.stringify(unmatched) }`,
            resp: { statusCode: 404 },
          };
          
          return (epOpts) ? epOpts : Promise.reject(matchErr);
        })
        .then((opts) => lookUpEpisodes(opts))
        .then((cache) => resolve(cache))
        .catch(({ err, resp } = {}) => {
          let error = `Couldn't find exact match for series: "${ userSeriesName }"`;
          if(resp) error += ` | ${ resp.statusCode } - ${ err }`;
        
          resolve({ error, name: userSeriesName });
        });
    }
  }
);