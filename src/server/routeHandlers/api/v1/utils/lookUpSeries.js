import convertNameToSlug from './convertNameToSlug';
import getSeries from './getSeries';
import getSeriesId from './getSeriesId';
import lookUpEpisodes from './lookUpEpisodes';

export default ({ cache, cacheKey, id, index, jwt, seriesName: userSeriesName }) => new Promise(
  (resolve, reject) => {
    if(cache[cacheKey]){
      const cachedItem = cache[cacheKey];
      console.log(`Skipping series look-up for: "${ cachedItem.name }"`);
      resolve({ cache: cachedItem, index });
    }
    else{
      new Promise((resolveSeries, rejectSeries) => {
        if(id){
          console.log(`Looking up series with TVDB id: "${ id }"`);
          
          getSeries({ jwt, id })
            .then(({ data: series }) => {
              const { seriesName, slug } = series;
              
              resolveSeries({
                index,
                jwt,
                seriesID: id,
                seriesName,
                seriesSlug: slug,
              });
            })
            .catch((err) => {
              rejectSeries(err);
            });
        }
        else{
          console.log(`Looking up series id for: "${ userSeriesName }"`);
          
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
                    index,
                    jwt,
                    seriesID: id,
                    seriesName,
                    seriesSlug: slug,
                  };
                  break;
                }
                else{
                  unmatched.push({ id, name: seriesName, slug });
                }
              }
              
              if(!epOpts) matchErr = {
                err: `No exact matches from: ${ JSON.stringify(unmatched) }`,
                possibleMatches: unmatched,
                resp: { statusCode: 404 },
              };
              
              (epOpts)
                ? resolveSeries(epOpts)
                : rejectSeries(matchErr);
            })
            .catch((err) => {
              rejectSeries(err);
            });
        }
      })
        .then((opts) => lookUpEpisodes(opts))
        .then((cache) => resolve(cache))
        .catch(({ err, possibleMatches, resp } = {}) => {
          let error = `Couldn't find exact match for series: "${ userSeriesName }"`;
          if(resp){
            error += ` | ${ resp.statusCode } - ${ err }`;
            console.error('  [ERROR]', error);
          }
          
          let payload = { error, index, name: userSeriesName };
          if(possibleMatches) payload.matches = possibleMatches;
          
          resolve(payload);
        });
    }
  }
);