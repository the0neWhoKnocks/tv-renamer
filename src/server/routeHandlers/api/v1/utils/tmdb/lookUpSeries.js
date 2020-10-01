import logger from 'SERVER/utils/logger';
import camelCase from '../camelCase';
import timeoutCodeCheck from '../timeoutCodeCheck';
import getSeriesDetails from './getSeriesDetails';
import getSeriesId from './getSeriesId';
import lookUpEpisodes from './lookUpEpisodes';

const log = logger('server:tmdb:lookUpSeries');

export default ({ 
  apiKey, 
  cache, 
  cacheKey,
  id, 
  index, 
  recentlyCached,
  seriesName: userSeriesName,
}) => new Promise(
  (resolve, reject) => {
    if(cache[cacheKey]){
      const cachedItem = cache[cacheKey];
      log(`Skipping series look-up for: "${ cachedItem.name }"`);
      resolve({ cache: cachedItem, index });
    }
    else{
      new Promise((resolveSeries, rejectSeries) => {
        // When cached files have been detected
        if(id){
          log(`Using TMDB id: "${ id }" for look-up`);
          resolveSeries({ seriesID: id });
        }
        // For initial series scrape
        else{
          log(`Looking up series id for: "${ userSeriesName }"`);
          
          getSeriesId({ apiKey, name: userSeriesName })
            .then(({ results: seriesMatches }) => {
              const unmatched = [];
              let opts, matchErr;
              
              for(let i=0; i<seriesMatches.length; i++){
                const { id, name: seriesName } = seriesMatches[i];
              
                if(
                  // first try an exact name match
                  userSeriesName === seriesName
                  // OR, use the only option that was returned
                  || (seriesMatches.length === 1) 
                ){
                  opts = { seriesID: id };
                  break;
                }
                else{
                  unmatched.push({ id, name: seriesName });
                }
              }
              
              if(!opts) matchErr = {
                err: `No exact matches from: ${ JSON.stringify(unmatched) }`,
                possibleMatches: unmatched,
                resp: { statusCode: 404 },
              };
              
              (opts)
                ? resolveSeries(opts)
                : rejectSeries(matchErr);
            })
            .catch((err) => {
              rejectSeries(err);
            });
        }
      })
        .then(opts => getSeriesDetails({ ...opts, apiKey })
          .then(({ episode_groups, name: seriesName, seasons }) => {
            let episodeGroups;
            
            if(episode_groups && episode_groups.results){
              // https://developers.themoviedb.org/3/tv-episode-groups/get-tv-episode-group-details
              // Original air date, Absolute, DVD, Digital, Story arc, Production, TV
              episodeGroups = episode_groups.results.reduce((obj, { id, name }) => {
                obj[camelCase(name)] = id;
                return obj;
              }, {});
            }
            
            return {
              episodeGroups,
              seasonNumbers: seasons.map(({ season_number }) => season_number),
              seriesID: opts.seriesID,
              seriesName,
            };
          })
        )
        .then(opts => lookUpEpisodes({ ...opts, apiKey, index, recentlyCached }))
        .then(cache => resolve(cache))
        .catch(({ err, possibleMatches, resp } = {}) => {
          let error = timeoutCodeCheck(err)
            ? `Request timed out for series look-up: "${ userSeriesName }"`
            : `Couldn't find exact match for series: "${ userSeriesName }"`;
          if(resp){
            error += ` | ${ resp.statusCode } - ${ err }`;
            log('  [ERROR]', error);
          }
          
          let payload = { error, index, name: userSeriesName };
          if(possibleMatches) payload.matches = possibleMatches;
          
          resolve(payload);
        });
    }
  }
);