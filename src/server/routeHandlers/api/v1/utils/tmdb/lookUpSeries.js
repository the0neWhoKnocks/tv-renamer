import fetch from 'node-fetch';
import {
  FANART_API__IMAGES,
  TMDB__EPISODE_GROUPS,
  TMDB__URL__BACKGROUND,
  TMDB__URL__POSTER,
} from 'ROOT/conf.app';
import logger from 'SERVER/utils/logger';
import timeoutCodeCheck from '../timeoutCodeCheck';
import getSeriesByName from './getSeriesByName';
import getSeriesDetails from './getSeriesDetails';
import lookUpEpisodes from './lookUpEpisodes';

const log = logger('server:tmdb:lookUpSeries');

export default ({ 
  apiKey, 
  cache, 
  cacheKey,
  fanarttvAPIKey,
  id, 
  index, 
  recentlyCached,
  seriesName: userSeriesName,
  seriesYear,
  update,
}) => new Promise(
  (resolve, reject) => {
    let _seriesYear = seriesYear;
    
    if(!update && cache[cacheKey]){
      const cachedItem = cache[cacheKey];
      log(`Using cache for series: "${ cachedItem.name }"`);
      resolve({ cache: cachedItem, index });
    }
    else{
      new Promise((resolveSeries, rejectSeries) => {
        // When cached files have been detected, or user assigns an ID
        if(id){
          log(`Using TMDB id: "${ id }" for look-up`);
          
          const data = { seriesID: id };
          
          // in some cases there can be multiple series with the same name, so 
          // do an extra check to verify the year
          if(!_seriesYear){
            getSeriesByName({ apiKey, name: userSeriesName, year: seriesYear })
              .then((seriesMatches) => {
                if(seriesMatches.length > 1){
                  seriesMatches
                    .filter(({ name }) => name.toLowerCase() === userSeriesName.toLowerCase())
                    .sort(({ first_air_date: currDate }, { first_air_date: nextDate }) => {
                      return +currDate.split('-')[0] - +nextDate.split('-')[0];
                    })
                    .forEach(({ first_air_date, id: _id }, ndx) => {
                      if(ndx > 0 && _id === id) _seriesYear = first_air_date.split('-')[0];
                    });
                }
                
                resolveSeries(data);
              });
          }
          else{
            resolveSeries(data);
          }
        }
        // For initial series scrape
        else{
          log(`Looking up series id for: "${ userSeriesName }"`);
          
          getSeriesByName({ apiKey, name: userSeriesName, year: seriesYear })
            .then((seriesMatches) => {
              const unmatched = [];
              let opts, matchErr;
              
              for(let i=0; i<seriesMatches.length; i++){
                const { id, name: seriesName } = seriesMatches[i];
                
                // NOTE - Can only key off of exact matches. Tried also keying
                // off whether there was only one match in the Array, but then
                // every request for that series wouldn't match anything in the
                // cache because the User didn't assign an ID.
                if(
                  // Unless a year is provided with every name, I can't assume
                  // the correct series will be chosen when there are multiple results
                  seriesMatches.length === 1
                  && userSeriesName.toLowerCase() === seriesName.toLowerCase()
                ){
                  opts = { seriesID: id };
                  break;
                }
                else{
                  unmatched.push({ id, name: seriesName });
                }
              }
              
              if(!opts) matchErr = {
                err: 'No exact match found',
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
          .then(async ({
            aggregate_credits,
            backdrop_path,
            content_ratings,
            external_ids,
            first_air_date: premiered,
            episode_groups,
            genres,
            name: seriesName,
            networks,
            overview,
            poster_path,
            seasons,
            status,
          }) => {
            let episodeGroups;
            if(episode_groups && episode_groups.results){
              episodeGroups = episode_groups.results.reduce((obj, { id, type }) => {
                const epGrpType = TMDB__EPISODE_GROUPS.get(type);
                if(epGrpType) obj[epGrpType] = id;
                return obj;
              }, {});
            }
            
            let actors = [];
            if(aggregate_credits && aggregate_credits.cast){
              actors = aggregate_credits.cast.map(({ name, order, profile_path: thumb, roles }) => {
                const role = (roles && roles.length && roles[0].character) || '';
                return { name, order, role, thumb };
              });
            }
            
            let mpaa = '';
            if(content_ratings && content_ratings.results){
              const r = content_ratings.results.find(({ iso_3166_1 }) => iso_3166_1 === 'US');
              if(r) mpaa = r.rating;
            }
            
            let studios = [];
            if(networks) studios = networks.map(({ name }) => name);
            
            let fanarttvImgs;
            if(external_ids && external_ids.tvdb_id){
              const API_URL = `${ FANART_API__IMAGES }/${ external_ids.tvdb_id }?api_key=${ fanarttvAPIKey }`;
              const {
                clearart = [],
                clearlogo = [],
                seasonposter = [],
                seasonthumb = [],
                showbackground = [],
                tvbanner = [],
                tvposter = [],
                tvthumb = [],
              } = await fetch(API_URL).then(resp => resp.json());
              
              fanarttvImgs = {
                clearArt: clearart.map(({ url }) => url),
                clearLogo: clearlogo.map(({ url }) => url),
                seasonPoster: seasonposter.reduce((obj, { season, url }) => {
                  if(!obj[season]) obj[season] = [];
                  obj[season].push(url);
                  return obj;
                }, {}),
                seasonThumb: seasonthumb.reduce((obj, { season, url }) => {
                  if(!obj[season]) obj[season] = [];
                  obj[season].push(url);
                  return obj;
                }, {}),
                seriesBackground: showbackground.map(({ url }) => url),
                seriesBanner: tvbanner.map(({ url }) => url),
                seriesPoster: tvposter.map(({ url }) => url),
                seriesThumb: tvthumb.map(({ url }) => url),
              };
            }
            
            return {
              episodeGroups,
              seasonNumbers: seasons.map(({ season_number }) => season_number),
              seriesData: {
                actors,
                genres: genres.map(({ name }) => name),
                images: {
                  fanarttv: fanarttvImgs,
                  tmdb: {
                    background: `${ TMDB__URL__BACKGROUND }${ backdrop_path }`,
                    poster: `${ TMDB__URL__POSTER }${ poster_path }`,
                  },
                },
                mpaa,
                studios,
                overview,
                premiered,
                status,
              },
              seriesID: opts.seriesID,
              seriesName,
            };
          })
        )
        .then(opts => lookUpEpisodes({
          ...opts,
          apiKey,
          cacheKey,
          index,
          recentlyCached,
          seriesYear: _seriesYear,
        }))
        .then(cache => resolve(cache))
        .catch((_err) => {
          if(_err instanceof Error){
            reject(_err.stack);
          }
          else{
            const { err, resp } = _err || {};
            
            let error = timeoutCodeCheck(err)
              ? `Request timed out for series look-up: "${ userSeriesName }"`
              : `Couldn't find exact match for series: "${ userSeriesName }"`;
            
            if(resp){
              error += ` | ${ resp.statusCode } - ${ err }`;
              log('  [ERROR]', error);
            }
            
            const payload = { error, index, name: userSeriesName };
            resolve(payload);
          }
        });
    }
  }
);