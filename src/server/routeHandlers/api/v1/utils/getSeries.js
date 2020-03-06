import request from 'request';
import {
  TVDB_API__SERIES,
  TVDB__TOKEN__SERIES_ID,
} from 'ROOT/conf.app';
import tvdbRequestProps from './tvdbRequestProps';
import tvdbResponseHandler from './tvdbResponseHandler';

export default ({ jwt, id }) => new Promise((resolve, reject) => {
  const reqURL = TVDB_API__SERIES.replace(TVDB__TOKEN__SERIES_ID, id);
  const reqOpts = { ...tvdbRequestProps({ jwt }) };
  
  request.get(
    reqURL, reqOpts,
    tvdbResponseHandler(resolve, reject, { reqOpts, reqURL })
  );
});