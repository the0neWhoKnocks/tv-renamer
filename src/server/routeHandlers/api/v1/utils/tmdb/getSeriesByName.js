import { teenyRequest as request } from 'teeny-request';
import {
  TMDB__API__SERIES_SEARCH,
  TMDB__TOKEN__SERIES_PAGE,
  TMDB__TOKEN__SERIES_QUERY,
  TMDB__TOKEN__SERIES_YEAR,
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
  const results = pages.reduce((arr, { results }) => {
    for(let i=0; i<results.length; i++){
      const result = results[i];
      if(result.name.toLowerCase() === name) arr.push(result);
    }
    return arr;
  }, []);
  
  return { results };
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