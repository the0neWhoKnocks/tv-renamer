import {
  TMDB__EPISODE_GROUP_TYPE__DVD,
  TMDB__URL__EPISODE_STILLS,
} from 'ROOT/conf.app';
import sanitizeName from '../sanitizeName';
import timeoutCodeCheck from '../timeoutCodeCheck';
import getSeriesEpisodes from './getSeriesEpisodes';

export default async function lookUpEpisodes({
  apiKey,
  episodeGroups,
  seasonNumbers,
  seriesID,
  seriesName,
} = {}) {  
  const dvdSeasons = {};
  const seasons = {};
  
  try {
    const { groups, seasons: _seasons } = await getSeriesEpisodes({ apiKey, episodeGroups, seasonNumbers, seriesID });
    
    for(let s=0; s<_seasons.length; s++){
      const episodes = _seasons[s];
      
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
          
          if(!seasons[airedSeason]) seasons[airedSeason] = { episodes: [] };
          
          const currSeasonEps = seasons[airedSeason].episodes;
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
            thumbnail: thumbnail ? `${ TMDB__URL__EPISODE_STILLS }${ thumbnail }` : '',
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
          
          if(dvdSeason !== null && !dvdSeasons[dvdSeason])
            dvdSeasons[dvdSeason] = { episodes: [] };
          
          if(dvdSeason !== null){
            const currDvdSeasonEps = dvdSeasons[dvdSeason].episodes;
            currDvdSeasonEps[dvdEpisodeNumber] = {
              aired,
              plot,
              thumbnail: thumbnail ? `${ TMDB__URL__EPISODE_STILLS }${ thumbnail }` : '',
              title: sanitizeName(episodeName),
            };
          }
        }
      }
    }
    
    return { dvdSeasons, seasons };
  }
  catch(_err) {
    let error;
    
    if(_err instanceof Error) error = _err.stack;
    else{
      const { err, resp = {} } = _err;
      error = timeoutCodeCheck(err)
        ? `Episodes look-up timed out for: "${ seriesName }"`
        : `Couldn't get episodes for: "${ seriesName }" | ${ resp.statusCode } - ${ err }`;
    }
    
    return { error, name: seriesName };
  }
}
