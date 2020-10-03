import { teenyRequest as request } from 'teeny-request';
import {
  TMDB__API__SERIES_DETAILS,
  TMDB__TOKEN__SERIES_ID,
} from 'ROOT/conf.app';
import transformAPIURL from '../transformAPIURL';
import tmdbRequestProps from './tmdbRequestProps';
import tmdbResponseHandler from './tmdbResponseHandler';

export default ({ apiKey, seriesID }) => new Promise((resolve, reject) => {
  const { params, reqURL } = transformAPIURL(TMDB__API__SERIES_DETAILS, [
    [TMDB__TOKEN__SERIES_ID, seriesID],
  ]);
  const reqOpts = { ...tmdbRequestProps({ apiKey, params }) };
  
  request(
    { uri: reqURL, ...reqOpts },
    tmdbResponseHandler(resolve, reject, { reqOpts, reqURL })
  );
});