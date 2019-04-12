import request from 'request';
import { TVDB_API__LOGIN_URL } from 'ROOT/conf.app';
import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
import saveConfig from './utils/saveConfig';
import tvdbRequestProps from './utils/tvdbRequestProps';

export default ({ reqData, res }) => {
  const { apiKey, userKey, userName } = reqData;
  
  request.post(
    TVDB_API__LOGIN_URL,
    {
      body: {
        apikey: apiKey,
        userkey: userKey,
        username: userName,
      },
      ...tvdbRequestProps(),
    },
    (err, resp, data) => {
      if(err) handleError({ res }, resp.statusCode, err);
      else{
        const jwtDate = Date.now();
        const confData = {
          jwt: data.token,
          jwtDate,
        };
        
        saveConfig(confData, res, (config) => {
          console.log(`[JWT] updated on ${ jwtDate }`);
          jsonResp(res, config);
        });
      }
    }
  );
};