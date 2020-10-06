import { teenyRequest as request } from 'teeny-request';
import {
  TMDB__API__SERIES_SEARCH,
  TMDB__TOKEN__SERIES_PAGE,
  TMDB__TOKEN__SERIES_QUERY,
  TMDB__TOKEN__SERIES_YEAR,
  TMDB__URL__THUMBNAILS,
} from 'ROOT/conf.app';
import transformAPIURL from '../transformAPIURL';
import tmdbRequestProps from './tmdbRequestProps';
import tmdbResponseHandler from './tmdbResponseHandler';

const reqPageOfMatches = ({ apiKey, name, page, year }) => new Promise((resolve, reject) => {
  const { params, reqURL } = transformAPIURL(TMDB__API__SERIES_SEARCH, [
    [TMDB__TOKEN__SERIES_PAGE, page],
    [TMDB__TOKEN__SERIES_QUERY, name],
    [TMDB__TOKEN__SERIES_YEAR, year],
  ]);
  const reqOpts = { ...tmdbRequestProps({ apiKey, params }) };
  
  request(
    { uri: reqURL, ...reqOpts },
    tmdbResponseHandler(resolve, reject, { reqOpts, reqURL })
  );
});

const filterSeriesByExactMatch = (name, pages) => {
  const matches = pages
    .reduce((arr, { results }) => {
      for(let i=0; i<results.length; i++){
        const result = results[i];
        if(result.name.toLowerCase() === name) arr.push(result);
      }
      return arr;
    }, [])
    .map(({ first_air_date, id, name: seriesName, overview, poster_path }) => ({
      id,
      name: seriesName,
      overview,
      thumbnail: poster_path && `${ TMDB__URL__THUMBNAILS }${ poster_path }`, // comes with a leading slash
      year: first_air_date ? +first_air_date.split('-')[0] : '', // can come through as undefined or empty if the series hasn't aired yet
    }))
    .filter(({ year }) => !!year)
    .sort(({ year: y1 }, { year: y2 }) => y2 - y1)
    .map((data, ndx, arr) => {
      if(ndx < arr.length - 1) data.name = `${ data.name } (${ data.year })`;
      delete data.year;
      return data;
    });
  
  return matches;
};

export default ({ apiKey, name, year = '' } = {}) => new Promise((resolve, reject) => {
  reqPageOfMatches({ apiKey, name, page: 1, year })
    .then((firstPage) => {
      const { total_pages: pageCount } = firstPage;
      
      if(pageCount > 1){
        const pending = [];
        
        for(let page=2; page<(pageCount+1); page++){
          pending.push(reqPageOfMatches({ apiKey, name, page, year }));
        }
        
        Promise.all(pending)
          .then((pages) => {
            resolve(filterSeriesByExactMatch(name, [firstPage, ...pages]));
          })
          .catch((err) => reject(err));
      }
      else{
        resolve(filterSeriesByExactMatch(name, [firstPage]));
      }
    })
    .catch((err) => reject(err));
});