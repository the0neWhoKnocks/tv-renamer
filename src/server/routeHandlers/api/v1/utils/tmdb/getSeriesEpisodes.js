import { teenyRequest as request } from 'teeny-request';
import {
  TMDB__API__SEASON_EPISODES,
  TMDB__API__SEASON_EPISODE_GROUP,
  TMDB__EPISODE_GROUP_TYPE__DVD,
  TMDB__EPISODE_GROUPS,
  TMDB__TOKEN__EPISODE_GROUP_ID,
  TMDB__TOKEN__SEASON_NUMBER,
  TMDB__TOKEN__SERIES_ID,
} from 'ROOT/conf.app';
import transformAPIURL from '../transformAPIURL';
import tmdbRequestProps from './tmdbRequestProps';
import tmdbResponseHandler from './tmdbResponseHandler';

const requestEpisodesBySeason = ({ apiKey, seasonNum, seriesID }) => new Promise(
  (resolve, reject) => {
    const { params, reqURL } = transformAPIURL(TMDB__API__SEASON_EPISODES, [
      [TMDB__TOKEN__SEASON_NUMBER, seasonNum],
      [TMDB__TOKEN__SERIES_ID, seriesID],
    ]);
    const reqOpts = { ...tmdbRequestProps({ apiKey, params }) };
    
    request(
      { uri: reqURL, ...reqOpts },
      tmdbResponseHandler(resolve, reject, { reqOpts, reqURL })
    );
  }
);

const requestEpisodesByGroup = ({ apiKey, groupID }) => new Promise((resolve, reject) => {
  const { params, reqURL } = transformAPIURL(TMDB__API__SEASON_EPISODE_GROUP, [
    [TMDB__TOKEN__EPISODE_GROUP_ID, groupID],
  ]);
  const reqOpts = { ...tmdbRequestProps({ apiKey, params }) };
  
  request(
    { uri: reqURL, ...reqOpts },
    tmdbResponseHandler(resolve, reject, { reqOpts, reqURL })
  );
});

export default ({ apiKey, episodeGroups, seasonNumbers, seriesID }) => new Promise((resolve, reject) => {
  const promises = seasonNumbers.map((seasonNum) => requestEpisodesBySeason({ apiKey, seasonNum, seriesID }));
  
  if(episodeGroups && episodeGroups[TMDB__EPISODE_GROUP_TYPE__DVD]){
    promises.push(requestEpisodesByGroup({ apiKey, groupID: episodeGroups[TMDB__EPISODE_GROUP_TYPE__DVD] }));
  }
  
  Promise.all(promises)
    .then(resolvedPromises => {
      resolve(resolvedPromises.reduce((obj, { episodes, groups, type }) => {
        if(episodes){
          if(!obj.seasons) obj.seasons = [];
          obj.seasons.push(episodes);
        }
        
        if(groups){
          if(!obj.groups) obj.groups = {};
          obj.groups[TMDB__EPISODE_GROUPS.get(type)] = groups;
        }
        
        return obj;
      }, {}));
    })
    .catch((err) => { reject(err); });
});