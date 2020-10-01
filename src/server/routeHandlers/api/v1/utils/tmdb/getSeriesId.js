import request from 'request';
import {
  TMDB__API__SERIES_SEARCH,
  TMDB__TOKEN__API_KEY,
  TMDB__TOKEN__SERIES_QUERY,
} from 'ROOT/conf.app';
import transformAPIURL from '../transformAPIURL';
import tmdbRequestProps from './tmdbRequestProps';
import tmdbResponseHandler from './tmdbResponseHandler';

export default ({ apiKey, name }) => new Promise((resolve, reject) => {
  const reqURL = transformAPIURL(TMDB__API__SERIES_SEARCH, [
    [TMDB__TOKEN__API_KEY, apiKey],
    [TMDB__TOKEN__SERIES_QUERY, name],
  ]);
  const reqOpts = { ...tmdbRequestProps() };
  
  request.get(
    reqURL, reqOpts,
    tmdbResponseHandler(resolve, reject, { reqOpts, reqURL })
  );
});