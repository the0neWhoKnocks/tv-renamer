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

const normalizeName = (name) => name.replace(/[-]/g, ' ').replace(/[.,!?:]/g, '').toLowerCase();

const filterSeriesByExactMatch = (name, pages, forAssign) => {
  // NOTE - If assigning an id, don't filter by exact match. There are cases
  // where a search for one name (possibly in translated English) is mapped by
  // tmdb to the correctly tranlated name. For example, looking for
  // "Mugen no Juunin" will return a couple results for "Blade of the Immortal".
  
  const matches = pages
    // build out Arrays of exact matches and fuzzy matches
    .reduce((arr, { results }) => {
      const [exactMatches, fuzzyMatches] = arr;
      const normalizedName = normalizeName(name);
      
      for(let i=0; i<results.length; i++){
        const result = results[i];
        
        if(normalizeName(result.name) === normalizedName) exactMatches.push(result);
        else if(forAssign) fuzzyMatches.push(result);
      }
      
      return arr;
    }, [[], []])
    // if there are exact matches, return those, otherwise return fuzzy results
    .reduce((arr, _matches) => {
      if(!arr.length && _matches.length) arr = _matches;
      return arr;
    }, [])
    // normalize results data
    .map(({ first_air_date, id, name, overview, poster_path }) => ({
      id,
      name,
      overview,
      thumbnail: poster_path && `${ TMDB__URL__THUMBNAILS }${ poster_path }`, // comes with a leading slash
      year: first_air_date ? +first_air_date.split('-')[0] : '', // can come through as undefined or empty if the series hasn't aired yet
    }))
    // remove any results that haven't been released yet
    .filter(({ year }) => !!year)
    // sort from newest to oldest
    .sort(({ year: y1 }, { year: y2 }) => y2 - y1)
    // add the series' year to the name
    .map((data, ndx, arr) => {
      // TODO - this could be an issue for fuzzy results, will have to keep an
      // eye on this.
      if(ndx < arr.length - 1) data.name = `${ data.name } (${ data.year })`;
      delete data.year;
      return data;
    });
  
  return matches;
};

export default ({ apiKey, forAssign, name, year = '' } = {}) => new Promise((resolve, reject) => {
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
            resolve(filterSeriesByExactMatch(name, [firstPage, ...pages], forAssign));
          })
          .catch((err) => reject(err));
      }
      else{
        resolve(filterSeriesByExactMatch(name, [firstPage], forAssign));
      }
    })
    .catch((err) => reject(err));
});