import getFiles from 'SERVER/utils/getFiles';
import jsonResp from 'SERVER/utils/jsonResp';
import filesFilter from './utils/filesFilter';
import loadConfig from './utils/loadConfig';

export default ({ res }) => {
  loadConfig((config) => {
    getFiles(config.sourceFolder, filesFilter)
      .then((files) => {
        jsonResp(res, files);
      });
  });
};