import http from 'http';
import {
  API__CONFIG,
  API__CONFIG_SAVE,
  API__FILES_LIST,
  API__FOLDER_LIST,
  API__JWT,
  API__PREVIEW_RENAME,
  API__SERIES_ID,
  API__SERIES_EPISODES,
} from 'ROOT/conf.repo';
import {
  checkForConfig,
  getFolderListing,
  getFilesList,
  getJWT,
  getSeriesId,
  getSeriesEpisodes,
  previewRename,
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
    [API__CONFIG, checkForConfig],
    [API__CONFIG_SAVE, updateConfig],
    [API__FILES_LIST, getFilesList],
    [API__FOLDER_LIST, getFolderListing],
    [API__JWT, getJWT],
    [API__PREVIEW_RENAME, previewRename],
    [API__SERIES_ID, getSeriesId],
    [API__SERIES_EPISODES, getSeriesEpisodes],
    [/\.[a-z]{2,4}/, handleStaticFile],
    ['*', handleError, [404, 'Page Not Found']],
  ]))
  .listen(port, (err) => {
    if(err) throw err;
    console.log(`Server running at http://localhost:${ port }/`);
  });
