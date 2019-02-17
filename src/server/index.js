import http from 'http';
import {
  API__CREDENTIALS,
  API__JWT,
  API__SERIES_ID,
  API__SERIES_EPISODES,
} from 'ROOT/conf.repo';
import {
  checkForCredentials,
  getJWT,
  getSeriesId,
  getSeriesEpisodes,
} from './routeHandlers/api/v1';
import handleError from './routeHandlers/error';
import handleRootRequest from './routeHandlers/root';
import handleStaticFile from './routeHandlers/static';
import requestHandler from './requestHandler';

const port = +process.env.PORT || 3001;

http
  .createServer(requestHandler([
    ['/', handleRootRequest],
    [API__CREDENTIALS, checkForCredentials],
    [API__JWT, getJWT],
    [API__SERIES_ID, getSeriesId],
    [API__SERIES_EPISODES, getSeriesEpisodes],
    [/\.[a-z]{2,4}/, handleStaticFile],
    ['*', handleError, [404, 'Page Not Found']],
  ]))
  .listen(port, (err) => {
    if(err) throw err;
    console.log(`Server running at http://localhost:${ port }/`);
  });
