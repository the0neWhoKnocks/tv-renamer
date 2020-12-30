import {
  VERSION__CACHE_SCHEMA,
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
  seriesData,
  seriesID,
  seriesName,
  seriesYear,
} = {}) => new Promise(
  (resolve, reject) => {
    // https://kodi.wiki/view/NFO_files/TV_shows#nfo_Tags
    const cache = {
      schema: VERSION__CACHE_SCHEMA,
      genres: seriesData.genres,
      id: seriesID, // maps to `uniqueid`
      images: seriesData.images,
      mpaa: seriesData.mpaa,
      name: `${ seriesName }${ seriesYear ? ` (${ seriesYear })` : '' }`, // maps to `title`
      plot: seriesData.plot,
      premiered: seriesData.premiered, // Release date of TV Show. Comes from Aired Date of the first episode.
      status: seriesData.status, // `Continuing` or `Ended` show
      studios: seriesData.studios,
      // NOTE - there are some nodes that have a ton of data, and are placed at the end for readability
      actors: seriesData.actors,
      dvdSeasons: {},
      seasons: {},
    };
    
    getSeriesEpisodes({ apiKey, episodeGroups, seasonNumbers, seriesID })
      .then(({ groups, seasons }) => {
        for(let s=0; s<seasons.length; s++){
          const episodes = seasons[s];
          
          // Sometimes a season will have missing data for an episode (GoT 
          // specials ep41 for example), and TMDB doesn't seem to have defaults
          // for missing episodes. Normally wouldn't be an issue, but when it
          // comes to determining the extra numbering for Anime, it becomes 
          // problematic. So, do an initial pass on the episode numbers, and
          // see if anything's missing, if there is, fill it in with a `null` value.
          for(let i=0; i<episodes.length; i++){
            const { episode_number: curr } = episodes[i] || {};
            const { episode_number: next } = episodes[i+1] || {};
            
            if(
              (curr && next)
              && curr + 1 !== next
              && i+1 !== episodes.length
            ){
              episodes.splice(i+1, 0, null);
            }
          }
          
          for(let i=0; i<episodes.length; i++){
            const currEp = episodes[i];
            
            if(currEp){ // can be `null` sometimes
              const {
                air_date: aired,
                episode_number: listedEpisodeNumber,
                name: episodeName,
                overview: plot,
                season_number: airedSeason,
                still_path: thumbnail,
              } = currEp;
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
              const formattedName = (episodeName)
                ? `${ additionalEpNum }${ sanitizeName(episodeName) }`
                : null;
              
              currSeasonEps[airedEpisodeNumber] = {
                aired,
                plot,
                thumbnail,
                title: formattedName,
              };
            }
          }
        }
        
        if(groups && groups[TMDB__EPISODE_GROUP_TYPE__DVD]){
          for(let i=0; i<groups[TMDB__EPISODE_GROUP_TYPE__DVD].length; i++){
            const { episodes: dvdEps } = groups[TMDB__EPISODE_GROUP_TYPE__DVD][i];
            const dvdSeason = i + 1;
            
            for(let j=0; j<dvdEps.length; j++){
              const {
                air_date: aired,
                name: episodeName,
                order,
                overview: plot,
                still_path: thumbnail,
              } = dvdEps[j];
              const dvdEpisodeNumber = order + 1;
              
              if(dvdSeason !== null && !cache.dvdSeasons[dvdSeason])
                cache.dvdSeasons[dvdSeason] = { episodes: [] };
              
              if(dvdSeason !== null){
                const currDvdSeasonEps = cache.dvdSeasons[dvdSeason].episodes;
                currDvdSeasonEps[dvdEpisodeNumber] = {
                  aired,
                  plot,
                  thumbnail,
                  title: sanitizeName(episodeName),
                };
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