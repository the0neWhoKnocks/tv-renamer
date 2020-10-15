import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
import logger from 'SERVER/utils/logger';
import loadConfig from './utils/loadConfig';
import getSeriesByName from './utils/tmdb/getSeriesByName';

const log = logger('api:getSeriesMatches');

export default function getSeriesMatches({ reqData, res }) {
  const { seriesName: _name } = reqData;
  const name = decodeURIComponent(_name);
  
  loadConfig(({ tmdbAPIKey: apiKey }) => {
    log(`Get series matches for "${ name }"`);
    
    getSeriesByName({ apiKey, name })
      .then((matches) => {
        if(matches.length) log(`Found matches for "${ name }": ${ matches }`);
        else log(`No matches for "${ name }"`);
        
        jsonResp(res, matches);
      })
      .catch((err) => {
        handleError({ res }, 500, `Could not get series matches for "${ name }":\n${ err }`);
      });
  });
}
