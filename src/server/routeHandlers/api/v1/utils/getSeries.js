import request from 'request';
import {
  TVDB_API__SERIES,
  TVDB__TOKEN__SERIES_ID,
} from 'ROOT/conf.app';
import tvdbRequestProps from './tvdbRequestProps';
import tvdbResponseHandler from './tvdbResponseHandler';

export default ({ jwt, id }) => new Promise((resolve, reject) => {
  request.get(
    TVDB_API__SERIES.replace(TVDB__TOKEN__SERIES_ID, id),
    { ...tvdbRequestProps({ jwt }) },
    tvdbResponseHandler(resolve, reject)
  );
});