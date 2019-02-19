import { readFile, writeFile } from 'fs';
import request from 'request';
import { CONFIG_PATH } from 'ROOT/conf.repo';
import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'UTILS/jsonResp';

const loadConfig = (cb) => {
  readFile(CONFIG_PATH, 'utf8', (err, config) => {
    const data = (err) ? {} : JSON.parse(config);
    cb(data);
  });
};

const saveConfig = (data, res, cb) => {
  loadConfig((config) => {
    Object.keys(data).forEach((key) => {
      const val = data[key];
      // delete blank values if they previously existed
      if(!val && config[key]) delete config[key];
      // or update/add the new value
      else config[key] = val;
    });
    
    writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8', (err) => {
      if(err) handleError(res, 500, err);
      else cb(config);
    });
  });
};

export const checkForConfig = ({ res }) => {
  loadConfig((config) => {
    jsonResp(res, config);
  });
};

export const updateConfig = ({ reqData, res }) => {
  saveConfig(reqData, res, (config) => {
    jsonResp(res, config);
  });
};

export const getJWT = ({ reqData, res }) => {
  const { apiKey, userKey, userName } = reqData;
  
  request.post(
    'https://api.thetvdb.com/login',
    {
      body: {
        apikey: apiKey,
        userkey: userKey,
        username: userName,
      },
      headers: {
        Accept: 'application/vnd.thetvdb.v2.2.0',
        'Accept-Language': 'en',
        'Content-Type': 'application/json',
      },
      json: true,
    },
    (err, resp, data) => {
      if(err) handleError(res, resp.statusCode, err);
      else{
        const confData = {
          jwt: data.token,
          jwtDate: Date.now(),
        };
        
        saveConfig(confData, res, (config) => {
          jsonResp(res, config);
        });
      }
    }
  );
  
  // TODO - Use credentials to get JWT `token`
  // Store in credentials with a timestamp. If the token is
  // older than 24 hours, get a new one.
  
};

export const getSeriesId = ({ res }) => {
  // TODO - Get series `id`
  // - Store name and id in DB to make future lookups faster
  // - Returns an Array, so if there's more than one result, prompt the user
  // to choose.
  res.end();
};

export const getSeriesEpisodes = ({ res }) => {
  // TODO - This returns all episodes for every season, so cache the episode
  // numbers along with their titles.
  // `airedSeason`, `airedEpisodeNumber`, `episodeName`
  res.end();
};