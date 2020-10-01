import http from 'http';
import {
  API__ASSIGN_ID,
  API__CONFIG,
  API__CONFIG_SAVE,
  API__DELETE_FILE,
  API__FILES_LIST,
  API__FOLDER_LIST,
  API__IDS,
  API__LOGS,
  API__PREVIEW_RENAME,
  API__RELEASES,
  API__RENAME,
  API__REPLACE,
} from 'ROOT/conf.app';
import jsonResp from 'SERVER/utils/jsonResp';
import prepData from './prepData';
import assignId from './routeHandlers/api/v1/assignId';
import changeFileNames from './routeHandlers/api/v1/changeFileNames';
import checkForConfig from './routeHandlers/api/v1/checkForConfig';
import deleteFile from './routeHandlers/api/v1/deleteFile';
import getFolderListing from './routeHandlers/api/v1/getFolderListing';
import getFilesList from './routeHandlers/api/v1/getFilesList';
import getIDs from './routeHandlers/api/v1/getIDs';
import getLogs from './routeHandlers/api/v1/getLogs';
import getReleases from './routeHandlers/api/v1/getReleases';
import previewRename from './routeHandlers/api/v1/previewRename';
import renameFiles from './routeHandlers/api/v1/renameFiles';
import updateConfig from './routeHandlers/api/v1/updateConfig';
import handleError from './routeHandlers/error';
import handleRootRequest from './routeHandlers/root';
import handleStaticFile from './routeHandlers/static';
import requestHandler from './requestHandler';

const port = +process.env.PORT || 3001;

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection at:', err.stack || err);
});

const inspectMiddleware = [];
if( process.env.DEBUG ){
  // https://nodejs.org/api/inspector.html
  const inspector = require('inspector');
  inspector.open();
  
  inspectMiddleware.push(
    ['/json', ({ reqData, res }) => {
      res.end();
    }, null, false],
    ['/json/list', ({ reqData, res }) => {
      jsonResp(res, { data: inspector.url() });
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
    [API__DELETE_FILE, deleteFile],
    [API__FILES_LIST, getFilesList],
    [API__FOLDER_LIST, getFolderListing],
    [API__IDS, getIDs],
    [API__LOGS, getLogs],
    [API__PREVIEW_RENAME, previewRename],
    [API__RELEASES, getReleases],
    [API__RENAME, renameFiles],
    [API__REPLACE, changeFileNames],
    [/\.[a-z]{2,4}/, handleStaticFile],
    ['*', handleError, [404, 'Page Not Found']],
  ]))
  .listen(port, (err) => {
    if(err) throw err;
    console.log(`Server running at http://localhost:${ port }/`);
  });
