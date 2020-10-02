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
      .then(({ episodes, groups }) => {
        for(let i=0; i<episodes.length; i++){
          const {
            name: episodeName,
            episode_number: airedEpisodeNumber,
            season_number: airedSeason,
          } = episodes[i];
          
          if(!cache.seasons[airedSeason]) cache.seasons[airedSeason] = { episodes: [] };
          
          const currSeasonEps = cache.seasons[airedSeason].episodes;
          currSeasonEps[airedEpisodeNumber] = sanitizeName(episodeName);
        }
        
        if(groups && groups.dvdOrder){
          for(let i=0; i<groups.dvdOrder.length; i++){
            const { episodes: dvdEps } = groups.dvdOrder[i];
            const dvdSeason = i + 1;
            
            for(let j=0; j<dvdEps.length; j++){
              const { name: episodeName } = dvdEps[j];
              const dvdEpisodeNumber = j + 1;
              
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
      .catch(({ err, resp }) => {
        resolve({
          error: timeoutCodeCheck(err)
            ? `Episodes look-up timed out for: "${ seriesName }"`
            : `Couldn't get episodes for: "${ seriesName }" | ${ resp.statusCode } - ${ err }`,
          index,
          name: seriesName,
        });
      });
  }
);