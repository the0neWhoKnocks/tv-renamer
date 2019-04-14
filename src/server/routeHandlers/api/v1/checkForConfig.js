import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
import {
  ERROR_TYPE__PARSE_FAILURE,
} from 'SERVER/utils/loadFile';
import loadConfig from './utils/loadConfig';

export default ({ res }) => {
  loadConfig((config, err) => {
    if(err && err.type === ERROR_TYPE__PARSE_FAILURE)
      handleError({ res }, 500, `Couldn't parse config '${ err.message }'`);
    else
      jsonResp(res, config);
  });
};