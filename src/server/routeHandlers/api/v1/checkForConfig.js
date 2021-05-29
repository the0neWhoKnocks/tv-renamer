import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
import {
  ERROR_TYPE__PARSE_FAILURE,
} from 'SERVER/utils/loadFile';
import loadConfig from './utils/loadConfig';

export default async function checkForConfig({ res }) {
  const { data: config, error } = await loadConfig();
  
  if (error && error.type === ERROR_TYPE__PARSE_FAILURE) {
    handleError({ res }, 500, `Couldn't parse config '${ error.message }'`);
  }
  else jsonResp(res, config);
}
