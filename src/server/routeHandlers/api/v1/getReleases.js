import request from 'request';
import {
  DOCKER_API__RELEASES,
} from 'ROOT/conf.app';
import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';

function formatBytes(a, b){
  if(a === 0) return '0 Bytes';
  
  const c = 1024;
  const d = b || 2;
  const e = ['Bytes','KB','MB','GB','TB','PB','EB','ZB','YB'];
  const f = Math.floor( Math.log(a) / Math.log(c) );
  
  return `${ parseFloat( (a / Math.pow(c,f) ).toFixed(d) ) } ${ e[f] }`;
}

export default ({ res }) => {
  request.get(
    DOCKER_API__RELEASES,
    { json: true },
    (err, resp, data) => {
      if(err) handleError({ res }, resp.statusCode, err);
      else{
        const releases = data.results.map(({ full_size, last_updated, name }) => {
          const date = new Date(last_updated);
          const dateOpts = ['en-US', {
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            month: '2-digit',
            timeZone: 'America/Los_Angeles',
            year: 'numeric',
          }];
          
          return {
            date: date.toLocaleDateString(...dateOpts),
            name,
            size: formatBytes(full_size),
          };
        });
        
        jsonResp(res, releases);
      }
    }
  );
};