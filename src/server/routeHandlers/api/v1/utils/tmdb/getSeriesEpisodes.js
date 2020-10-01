import { teenyRequest as request } from 'teeny-request';
import {
  TMDB__API__SEASON_EPISODES,
  TMDB__API__SEASON_EPISODE_GROUP,
  TMDB__TOKEN__EPISODE_GROUP_ID,
  TMDB__TOKEN__SEASON_NUMBER,
  TMDB__TOKEN__SERIES_ID,
} from 'ROOT/conf.app';
import camelCase from '../camelCase';
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
  
  if(episodeGroups && episodeGroups.dvdOrder){
    promises.push(requestEpisodesByGroup({ apiKey, groupID: episodeGroups.dvdOrder }));
  }
  
  Promise.all(promises)
    .then(resolvedPromises => {
      resolve(resolvedPromises.reduce((obj, { episodes, groups, name }) => {
        if(episodes){
          if(!obj.episodes) obj.episodes = [];
          obj.episodes = [...obj.episodes, ...episodes];
        }
        
        if(groups){
          if(!obj.groups) obj.groups = {};
          obj.groups[camelCase(name)] = groups;
        }
        
        return obj;
      }, {}));
    })
    .catch((err) => { reject(err); });
});