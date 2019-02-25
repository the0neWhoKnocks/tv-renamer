import jsonResp from 'SERVER/utils/jsonResp';
import saveConfig from './utils/saveConfig';

export default ({ reqData, res }) => {
  saveConfig(reqData, res, (config) => {
    jsonResp(res, config);
  });
};