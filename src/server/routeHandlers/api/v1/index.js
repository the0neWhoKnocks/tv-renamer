import {
  readFile,
  writeFile,
} from 'fs';
import {
  resolve,
  sep,
} from 'path';
import request from 'request';
import sanitizeFilename from 'sanitize-filename';
import {
  PUBLIC_CONFIG,
  PUBLIC_CACHE,
  TVDB_API__EPISODES_URL,
  TVDB_API__LOGIN_URL,
  TVDB_API__SERIES_URL,
  TVDB_API__VERSION_HEADER,
  TVDB__TOKEN__SERIES_ID,
  TVDB__TOKEN__SERIES_NAME,
} from 'ROOT/conf.app';
import handleError from 'SERVER/routeHandlers/error';
import getDirectoryListing from 'SERVER/utils/getDirectoryListing';
import getFiles from 'SERVER/utils/getFiles';
import jsonResp from 'SERVER/utils/jsonResp';

const loadFile = ({ _default = {}, cb, file }) => {
  readFile(file, 'utf8', (err, file) => {
    const data = (err) ? _default : JSON.parse(file);
    cb(data);
  });
};

const saveFile = ({ cb, data, file, res }) => {
  writeFile(file, JSON.stringify(data, null, 2), 'utf8', (err) => {
    if(err) handleError({ res }, 500, err);
    else cb(data);
  });
};

const loadConfig = (cb) => {
  loadFile({ cb, file: PUBLIC_CONFIG });
};

const genCacheName = (name) => {
  const _name = sanitizeFilename(name)
    .toLowerCase()
    .replace(/\s/g, '_')
    .replace(/'/g, '');
  
  return `${ PUBLIC_CACHE }/${ _name }.json`;
};

const loadCacheItem = (name) => new Promise((resolve, reject) => {
  loadFile({
    _default: null,
    cb: (file) => resolve({ file, name }),
    file: genCacheName(name),
  });
});

const cacheData = ({ data, name, res }) => new Promise((resolve, reject) => {
  saveFile({
    cb: () => {
      console.log(`Cached series: "${ name }"`);
      return resolve(data);
    },
    data,
    file: genCacheName(name),
    res,
  });
});

const saveConfig = (data, res, cb) => {
  loadConfig((config) => {
    Object.keys(data).forEach((key) => {
      const val = data[key];
      // delete blank values if they previously existed
      if(!val && config[key]) delete config[key];
      // or update/add the new value
      else config[key] = val;
    });
    
    saveFile({ cb, data: config, file: PUBLIC_CONFIG, res });
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

const tvdbResponseHandler = (resolve, reject) => (err, resp, data) => {
  return (err || resp.statusCode > 399)
    ? reject({
      err: err || data.Error,
      resp,
    })
    : resolve(data.data);
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

export const getFilesList = ({ res }) => {
  loadConfig((config) => {
    const extensions = ['avi', 'mkv', 'mp4'];
    const filter = (file) => new RegExp(`.(?:${ extensions.join('|') })$`).test(file);
    getFiles(config.sourceFolder, filter)
      .then((files) => {
        jsonResp(res, files);
      });
  });
};

export const getFolderListing = ({ reqData, res }) => {
  // if a path isn't specified, start at root of server
  const currentDirectory = (reqData.path)
    ? reqData.path
    // TODO - maybe have a reverse lookup of a folder name instead
    : resolve(__dirname, '../../../../');
  
  getDirectoryListing(currentDirectory)
    .then((folders) => {
      jsonResp(res, {
        current: currentDirectory,
        folders,
        separator: sep,
      });
    })
    .catch((err) => {
      handleError({ res }, 500, err);
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
      if(err) handleError({ res }, resp.statusCode, err);
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

const getSeriesId = ({ jwt, name }) => new Promise((resolve, reject) => {
  request.get(
    TVDB_API__SERIES_URL.replace(
      TVDB__TOKEN__SERIES_NAME,
      encodeURIComponent(name)
    ),
    { ...tvdbRequestProps({ jwt }) },
    tvdbResponseHandler(resolve, reject)
  );
});

export const getSeriesEpisodes = ({ jwt, seriesID }) => new Promise((resolve, reject) => {
  request.get(
    TVDB_API__EPISODES_URL.replace(TVDB__TOKEN__SERIES_ID, seriesID),
    { ...tvdbRequestProps({ jwt }) },
    tvdbResponseHandler(resolve, reject)
  );
});

export const previewRename = ({ reqData, res }) => {
  const names = reqData.names;
  
  // remove duplicates for the series request
  const uniqueNames = [];
  const cachedItems = [];
  for(let i=0; i<names.length; i++){
    const name = names[i] && names[i].name;
    if(name && !uniqueNames.includes(name)) {
      uniqueNames.push(name);
      cachedItems.push(loadCacheItem(name));
    }
  }
  
  Promise.all(cachedItems)
    .then((_cachedItems) => {
      // If all series' are already cached, don't bother loading config, or
      // doing any series look-ups, jump right to renaming.
      const cache = {};
      let allCached = true;
      
      for(let i=0; i<_cachedItems.length; i++){
        const { file, name } = _cachedItems[i];
        if(!file) allCached = false;
        cache[name] = file;
      }
      
      if(allCached){
        console.log('Skipping config load and series look-ups');
      }
      else{
        console.log('Not all items were cached, proceed to look-ups');
        
        loadConfig(({ jwt }) => {
          const seriesName = uniqueNames[1]; // TODO - use item from loop
          
          if(cache[seriesName]){
            console.log(`Skipping series look-up for: "${ seriesName }"`);
            console.log(cache[seriesName]);
            res.end();
          }
          else{
            console.log(`Looking up series: "${ seriesName }"`);
            
            getSeriesId({ jwt, name: seriesName })
              .then((seriesMatches) => {
                // for now, just care about an exact name match
                let seriesID;
                
                for(let i=0; i<seriesMatches.length; i++){
                  const { id, seriesName } = seriesMatches[i];
                  if(seriesName === seriesName){
                    seriesID = id;
                    break;
                  }
                }
                
                if(seriesID){
                  const cache = {
                    id: seriesID,
                    season: {},
                  };
                  
                  getSeriesEpisodes({ jwt, seriesID })
                    .then((episodes) => {
                      for(let i=0; i<episodes.length; i++){
                        const {
                          airedSeason,
                          airedEpisodeNumber,
                          episodeName,
                        } = episodes[i];
                        
                        if(!cache.season[airedSeason])
                          cache.season[airedSeason] = { episodes: [] };
                        
                        const currSeasonEps = cache.season[airedSeason].episodes;
                        currSeasonEps[airedEpisodeNumber] = episodeName;
                      }
                      
                      cacheData({ data: cache, name: seriesName, res })
                        .then(() => res.end());
                    })
                    .catch(({ err, resp }) => {
                      handleError({ res }, resp.statusCode, err);
                    });
                }
                else{
                  // TODO - temp for now so the request completes
                  res.end();
                }
              })
              .catch(({ err, resp }) => {
                handleError({ res }, resp.statusCode, err);
              });
          }
        });
      }
    });
};