import http from 'http';
import handleError from './routeHandlers/error';
import handleRootRequest from './routeHandlers/root';
import handleStaticFile from './routeHandlers/static';
import requestHandler from './requestHandler';

const port = +process.env.PORT || 3001;

http
  .createServer(requestHandler([
    ['/', handleRootRequest],
    [/\.[a-z]{2,4}/, handleStaticFile],
    ['*', handleError, [404, 'Page Not Found']],
  ]))
  .listen(port, (err) => {
    if(err) throw err;
    console.log(`Server running at http://localhost:${ port }/`);
  });
