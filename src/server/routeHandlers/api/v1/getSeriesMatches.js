import { TMDB__URL__THUMBNAILS } from 'ROOT/conf.app';
import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
import loadConfig from './utils/loadConfig';
import getSeriesByName from './utils/tmdb/getSeriesByName';

export default function getSeriesMatches({ reqData, res }) {
  const { seriesName: _name } = reqData;
  const name = decodeURIComponent(_name);
  
  loadConfig(({ tmdbAPIKey: apiKey }) => {
    getSeriesByName({ apiKey, name })
      .then(({ results: seriesMatches }) => {
        const matches = [];
        
        for(let i=0; i<seriesMatches.length; i++){
          const { first_air_date, id, name: seriesName, overview, poster_path } = seriesMatches[i];
          
          matches.push({
            id,
            name: seriesName,
            overview,
            // NOTE - `poster_path` comes with a leading slash
            thumbnail: poster_path && `${ TMDB__URL__THUMBNAILS }${ poster_path }`,
            year: +first_air_date.split('-')[0],
          });
        }
        
        jsonResp(
          res,
          matches.sort(({ year: y1 }, { year: y2 }) => y2 - y1)
        );
      })
      .catch((err) => {
        handleError({ res }, 500, `Could not get series matches for "${ name }":\n${ err }`);
      });
  });
}
