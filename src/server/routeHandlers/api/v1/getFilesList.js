import getFiles from 'SERVER/utils/getFiles';
import jsonResp from 'SERVER/utils/jsonResp';
import sortArrayByProp from 'SERVER/utils/sortArrayByProp';
import filesFilter from './utils/filesFilter';
import loadConfig from './utils/loadConfig';

export default ({ res }) => {
  loadConfig((config) => {
    getFiles(config.sourceFolder, filesFilter)
      .then((files) => {
        // sort by `name` since folder lookups show up first sometimes
        // const sortedFiles = [];
        files.sort(sortArrayByProp('name'));
        
        jsonResp(res, files);
      });
  });
};