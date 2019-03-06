import jsonResp from 'SERVER/utils/jsonResp';
import loadRenameLog from './utils/loadRenameLog';

export default ({ res }) => {
  loadRenameLog((logs) => {
    jsonResp(res, logs);
  });
};