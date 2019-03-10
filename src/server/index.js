import http from 'http';
import {
  API__ASSIGN_ID,
  API__CONFIG,
  API__CONFIG_SAVE,
  API__FILES_LIST,
  API__FOLDER_LIST,
  API__IDS,
  API__JWT,
  API__LOGS,
  API__PREVIEW_RENAME,
  API__RENAME,
} from 'ROOT/conf.app';
import {
  assignId,
  checkForConfig,
  getFolderListing,
  getFilesList,
  getIDs,
  getJWT,
  getLogs,
  previewRename,
  renameFiles,
  updateConfig,
} from './routeHandlers/api/v1';
import handleError from './routeHandlers/error';
import handleRootRequest from './routeHandlers/root';
import handleStaticFile from './routeHandlers/static';
import requestHandler from './requestHandler';

const port = +process.env.PORT || 3001;

http
  .createServer(requestHandler([
    ['/', handleRootRequest],
    [API__ASSIGN_ID, assignId],
    [API__CONFIG, checkForConfig],
    [API__CONFIG_SAVE, updateConfig],
    [API__FILES_LIST, getFilesList],
    [API__FOLDER_LIST, getFolderListing],
    [API__IDS, getIDs],
    [API__JWT, getJWT],
    [API__LOGS, getLogs],
    [API__PREVIEW_RENAME, previewRename],
    [API__RENAME, renameFiles],
    [/\.[a-z]{2,4}/, handleStaticFile],
    ['*', handleError, [404, 'Page Not Found']],
  ]))
  .listen(port, (err) => {
    if(err) throw err;
    console.log(`Server running at http://localhost:${ port }/`);
  });
