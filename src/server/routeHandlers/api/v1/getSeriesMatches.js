import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
import loadConfig from './utils/loadConfig';
import getSeriesByName from './utils/tmdb/getSeriesByName';

export default function getSeriesMatches({ reqData, res }) {
  const { seriesName: _name } = reqData;
  const name = decodeURIComponent(_name);
  
  loadConfig(({ tmdbAPIKey: apiKey }) => {
    getSeriesByName({ apiKey, name })
      .then((matches) => {
        jsonResp(res, matches);
      })
      .catch((err) => {
        handleError({ res }, 500, `Could not get series matches for "${ name }":\n${ err }`);
      });
  });
}
