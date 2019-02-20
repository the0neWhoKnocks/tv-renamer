import { readFile, writeFile } from 'fs';
import request from 'request';
import {
  CONFIG_PATH,
  TVDB_API__EPISODES_URL,
  TVDB_API__LOGIN_URL,
  TVDB_API__SERIES_URL,
  TVDB_API__VERSION_HEADER,
  TVDB__TOKEN__SERIES_ID,
  TVDB__TOKEN__SERIES_NAME,
} from 'ROOT/conf.repo';
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

const tvdbRequestProps = ({
  jwt,
} = {}) => {
  const headers = {
    Accept: TVDB_API__VERSION_HEADER,
    'Accept-Language': 'en',
    'Content-Type': 'application/json',
  };
  
  if(jwt) headers.Authorization = `Bearer ${ jwt }`;
  
  return {
    headers,
    json: true,
  };  
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
};

export const getSeriesId = ({ res }) => {
  // TODO - Get series `id`
  // - Store name and id in DB to make future lookups faster
  // - Returns an Array, so if there's more than one result, prompt the user
  // to choose.
  // TODO - the 'series name' needs to be encoded. It may already come through
  // as such from the request, will need to check.
  
  loadConfig(({ jwt }) => {
    request.get(
      TVDB_API__SERIES_URL.replace(TVDB__TOKEN__SERIES_NAME, 'encoded seriesName'),
      {
        // qs
        ...tvdbRequestProps({ jwt }),
      },
    );
    // res.end();
  });
};

export const getSeriesEpisodes = ({ res }) => {
  // TODO - This returns all episodes for every season, so cache the episode
  // numbers along with their titles.
  // `airedSeason`, `airedEpisodeNumber`, `episodeName`
  
  loadConfig(({ jwt }) => {
    request.get(
      TVDB_API__EPISODES_URL.replace(TVDB__TOKEN__SERIES_ID, 'seriesID'),
      {
        // qs
        ...tvdbRequestProps({ jwt }),
      },
    );
    // res.end();
  });
};