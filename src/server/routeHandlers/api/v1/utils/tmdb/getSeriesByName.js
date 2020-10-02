import { teenyRequest as request } from 'teeny-request';
import {
  TMDB__API__SERIES_SEARCH,
  TMDB__TOKEN__SERIES_QUERY,
  TMDB__TOKEN__SERIES_YEAR,
} from 'ROOT/conf.app';
import transformAPIURL from '../transformAPIURL';
import tmdbRequestProps from './tmdbRequestProps';
import tmdbResponseHandler from './tmdbResponseHandler';

export default ({ apiKey, name, year }) => new Promise((resolve, reject) => {
  const { params, reqURL } = transformAPIURL(TMDB__API__SERIES_SEARCH, [
    [TMDB__TOKEN__SERIES_QUERY, name],
    [TMDB__TOKEN__SERIES_YEAR, year],
  ]);
  const reqOpts = { ...tmdbRequestProps({ apiKey, params }) };
  
  request(
    { uri: reqURL, ...reqOpts },
    tmdbResponseHandler(resolve, reject, { reqOpts, reqURL })
  );
});