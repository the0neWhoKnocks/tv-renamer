import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
import logger from 'SERVER/utils/logger';
import loadConfig from './utils/loadConfig';
import getSeriesByName from './utils/tmdb/getSeriesByName';

const log = logger('api:getSeriesMatches');

export default async function getSeriesMatches({ reqData, res }) {
  const { data: { tmdbAPIKey: apiKey } } = await loadConfig();
  const { seriesName: _name } = reqData;
  const name = decodeURIComponent(_name);
  
  log(`Get series matches for "${ name }"`);
  
  try {
    const matches = await getSeriesByName({ apiKey, name });
    
    if(matches.length) log(`Found matches for "${ name }": ${ matches }`);
    else log(`No matches for "${ name }"`);
    
    jsonResp(res, matches);
  }
  catch(err) {
    handleError({ res }, 500, `Could not get series matches for "${ name }":\n${ err }`);
  }
}
