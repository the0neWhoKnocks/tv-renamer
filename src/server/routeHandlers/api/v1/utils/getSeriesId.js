import request from 'request';
import {
  TVDB_API__SERIES_SEARCH,
  TVDB__TOKEN__SERIES_NAME,
} from 'ROOT/conf.app';
import tvdbRequestProps from './tvdbRequestProps';
import tvdbResponseHandler from './tvdbResponseHandler';

export default ({ jwt, name }) => new Promise((resolve, reject) => {
  const reqURL = TVDB_API__SERIES_SEARCH.replace(
    TVDB__TOKEN__SERIES_NAME,
    encodeURIComponent(name)
  );
  const reqOpts = { ...tvdbRequestProps({ jwt }) };
  
  request.get(
    reqURL, reqOpts,
    tvdbResponseHandler(resolve, reject, { reqOpts, reqURL })
  );
});