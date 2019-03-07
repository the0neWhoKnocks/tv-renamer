import getFiles from 'SERVER/utils/getFiles';
import jsonResp from 'SERVER/utils/jsonResp';
import loadConfig from './utils/loadConfig';

export default ({ res }) => {
  loadConfig((config) => {
    const extensions = ['avi', 'mkv', 'mp4'];
    const filter = (file) => {
      const fileTypeOk = new RegExp(`\\.(?:${ extensions.join('|') })$`).test(file);
      const isSample = new RegExp(`\\.sample\\.(?:${ extensions.join('|') })$`).test(file);
      return fileTypeOk && !isSample;
    };
    getFiles(config.sourceFolder, filter)
      .then((files) => {
        jsonResp(res, files);
      });
  });
};