import request from 'request';
import {
  TVDB_API__SERIES_URL,
  TVDB__TOKEN__SERIES_NAME,
} from 'ROOT/conf.app';
import tvdbRequestProps from './tvdbRequestProps';
import tvdbResponseHandler from './tvdbResponseHandler';

export default ({ jwt, name }) => new Promise((resolve, reject) => {
  request.get(
    TVDB_API__SERIES_URL.replace(
      TVDB__TOKEN__SERIES_NAME,
      encodeURIComponent(name)
    ),
    { ...tvdbRequestProps({ jwt }) },
    tvdbResponseHandler(resolve, reject)
  );
});