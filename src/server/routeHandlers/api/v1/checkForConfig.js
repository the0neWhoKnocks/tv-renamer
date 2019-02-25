import jsonResp from 'SERVER/utils/jsonResp';
import loadConfig from './utils/loadConfig';

export default ({ res }) => {
  loadConfig((config) => {
    jsonResp(res, config);
  });
};