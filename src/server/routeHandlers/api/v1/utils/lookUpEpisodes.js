import cacheData from './cacheData';
import getSeriesEpisodes from './getSeriesEpisodes';

export default ({ jwt, seriesID, seriesName, seriesSlug }) => new Promise(
  (resolve, reject) => {
    const cache = {
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
            episodeName,
          } = episodes[i];
          
          if(!cache.seasons[airedSeason])
            cache.seasons[airedSeason] = { episodes: [] };
          
          const currSeasonEps = cache.seasons[airedSeason].episodes;
          currSeasonEps[airedEpisodeNumber] = episodeName;
        }
        
        cacheData({ data: cache })
          .then(() => resolve(cache));
      })
      .catch(({ err, resp }) => {
        resolve({
          error: `Couldn't get episodes for: "${ seriesName }" | ${ resp.statusCode } - ${ err }`,
          name: seriesName,
        });
      });
  }
);