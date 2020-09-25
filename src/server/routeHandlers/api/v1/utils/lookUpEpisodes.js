import cacheData from './cacheData';
import getSeriesEpisodes from './getSeriesEpisodes';
import timeoutCodeCheck from './timeoutCodeCheck';

export default ({ index, jwt, seriesID, seriesName, seriesSlug }) => new Promise(
  (resolve, reject) => {
    const cache = {
      dvdSeasons: {},
      id: seriesID,
      name: seriesName,
      seasons: {},
      slug: seriesSlug,
    };
    
    getSeriesEpisodes({ jwt, seriesID })
      .then((episodes) => {
        for(let i=0; i<episodes.length; i++){
          const {
            airedSeason,
            airedEpisodeNumber,
            dvdEpisodeNumber,
            dvdSeason,
            episodeName,
          } = episodes[i];
          
          if(!cache.seasons[airedSeason])
            cache.seasons[airedSeason] = { episodes: [] };
          
          const currSeasonEps = cache.seasons[airedSeason].episodes;
          currSeasonEps[airedEpisodeNumber] = episodeName;
          
          if(dvdSeason !== null && !cache.dvdSeasons[dvdSeason])
            cache.dvdSeasons[dvdSeason] = { episodes: [] };
          
          if(dvdSeason !== null){
            const currDvdSeasonEps = cache.dvdSeasons[dvdSeason].episodes;
            currDvdSeasonEps[dvdEpisodeNumber] = episodeName;
          }
        }
        
        cacheData({ data: cache })
          .then(() => resolve({ cache, index }));
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