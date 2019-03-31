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
  API__RELEASES,
} from 'ROOT/conf.app';
import jsonResp from 'SERVER/utils/jsonResp';
import prepData from './prepData';
import {
  assignId,
  checkForConfig,
  getFolderListing,
  getFilesList,
  getIDs,
  getJWT,
  getLogs,
  getReleases,
  previewRename,
  renameFiles,
  updateConfig,
} from './routeHandlers/api/v1';
import handleError from './routeHandlers/error';
import handleRootRequest from './routeHandlers/root';
import handleStaticFile from './routeHandlers/static';
import requestHandler from './requestHandler';

const port = +process.env.PORT || 3001;

const inspectMiddleware = [];
if( process.env.DEBUG ){
  // https://nodejs.org/api/inspector.html
  const inspector = require('inspector');
  inspectMiddleware.push(
    ['/json', ({ reqData, res }) => {
      // open, close, url, Session
      inspector.open();
      res.end();
    }, null, false],
    ['/json/version', ({ res }) => {
      jsonResp(res, {
        Browser: `node.js/${ process.version }`,
        'Protocol-Version': '1.1',
      });
    }, null, false],
  );
}

prepData();

http
  .createServer(requestHandler([
    ...inspectMiddleware,
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
    [API__RELEASES, getReleases],
    [/\.[a-z]{2,4}/, handleStaticFile],
    ['*', handleError, [404, 'Page Not Found']],
  ]))
  .listen(port, (err) => {
    if(err) throw err;
    console.log(`Server running at http://localhost:${ port }/`);
  });
