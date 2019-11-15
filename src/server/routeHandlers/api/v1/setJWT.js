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
      else if(data.Error){
        let msg = `\n\ntheTVDB API says: "${ data.Error }"`;
        
        if(data.Error.includes('User Account')){
          msg += '\n\nYou may want to head over to the TVDB dashboard and verify your info.';
          msg += '\nUser Key: https://thetvdb.com/dashboard/account/editinfo';
          msg += '\nAPI Key: https://thetvdb.com/dashboard/account/apikeys';
        }
        // https://thetvdb.com/dashboard/account/editinfo
        handleError({ res }, resp.statusCode, `Could not set JWT ${ msg }`);
      }
      else{
        const jwtDate = Date.now();
        const confData = {
          jwt: data.token,
          jwtDate,
        };
        
        saveConfig(confData, res, (config) => {
          const updateTime = new Date(jwtDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
          console.log(`[JWT] updated on "${ updateTime }"`);
          jsonResp(res, config);
        });
      }
    }
  );
};