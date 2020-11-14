import {
  TMDB__EPISODE_GROUP_TYPE__DVD,
} from 'ROOT/conf.app';
import cacheData from '../cacheData';
import sanitizeName from '../sanitizeName';
import timeoutCodeCheck from '../timeoutCodeCheck';
import getSeriesEpisodes from './getSeriesEpisodes';

export default ({
  apiKey,
  episodeGroups,
  index,
  recentlyCached,
  seasonNumbers, 
  seriesID,
  seriesName,
  seriesYear,
} = {}) => new Promise(
  (resolve, reject) => {
    const cache = {
      dvdSeasons: {},
      id: seriesID,
      name: `${ seriesName }${ seriesYear ? ` (${ seriesYear })` : '' }`,
      seasons: {},
    };
    
    getSeriesEpisodes({ apiKey, episodeGroups, seasonNumbers, seriesID })
      .then(({ groups, seasons }) => {
        for(let s=0; s<seasons.length; s++){
          const episodes = seasons[s];
          
          for(let i=0; i<episodes.length; i++){
            const {
              episode_number: listedEpisodeNumber,
              name: episodeName,
              season_number: airedSeason,
            } = episodes[i];
            const airedEpisodeNumber = i + 1;
            
            if(!cache.seasons[airedSeason]) cache.seasons[airedSeason] = { episodes: [] };
            
            const currSeasonEps = cache.seasons[airedSeason].episodes;
            // Some series (like Anime), list episode numbers by the total episodes
            // in the series. So if a series has 2 seasons, each 12 episodes long,
            // the last episode of Season 2 would be 24, not 12. To account for
            // such cases, prepend the additional episode info to the episode
            // name (not the episode) to not potentially break any media manager
            // parsing.
            const additionalEpNum = (airedEpisodeNumber !== listedEpisodeNumber)
              ? `(${ listedEpisodeNumber }) `
              : '';
            currSeasonEps[airedEpisodeNumber] = (episodeName)
              ? `${ additionalEpNum }${ sanitizeName(episodeName) }`
              : null;
          }
        }
        
        if(groups && groups[TMDB__EPISODE_GROUP_TYPE__DVD]){
          for(let i=0; i<groups[TMDB__EPISODE_GROUP_TYPE__DVD].length; i++){
            const { episodes: dvdEps } = groups[TMDB__EPISODE_GROUP_TYPE__DVD][i];
            const dvdSeason = i + 1;
            
            for(let j=0; j<dvdEps.length; j++){
              const {
                name: episodeName,
                order,
              } = dvdEps[j];
              const dvdEpisodeNumber = order + 1;
              
              if(dvdSeason !== null && !cache.dvdSeasons[dvdSeason])
                cache.dvdSeasons[dvdSeason] = { episodes: [] };
              
              if(dvdSeason !== null){
                const currDvdSeasonEps = cache.dvdSeasons[dvdSeason].episodes;
                currDvdSeasonEps[dvdEpisodeNumber] = sanitizeName(episodeName);
              }
            }
          }
        }
        
        if(!recentlyCached.includes(cache.name)){
          cacheData({ data: cache }).then(() => resolve({ cache, index }));
          recentlyCached.push(cache.name);
        }
        else{
          resolve({ cache, index });
        }
      })
      .catch((_err) => {
        let error;
        
        if(_err instanceof Error){
          error = _err.stack;
        }
        else{
          const { err, resp = {} } = _err;
          error = timeoutCodeCheck(err)
            ? `Episodes look-up timed out for: "${ seriesName }"`
            : `Couldn't get episodes for: "${ seriesName }" | ${ resp.statusCode } - ${ err }`;
        }
        
        resolve({ error, index, name: seriesName });
      });
  }
);