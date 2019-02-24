import {
  readFile,
  writeFile,
} from 'fs';
import {
  resolve,
  sep,
} from 'path';
import request from 'request';
import {
  CONFIG_PATH,
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
      if(err) handleError({ res }, 500, err);
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

export const getSeriesId = ({ reqData, res }) => {
  // TODO - Get series `id`
  // - Store name and id in DB to make future lookups faster
  // - Returns an Array, so if there's more than one result, prompt the user
  // to choose.
  // TODO - the 'series name' needs to be encoded. It may already come through
  // as such from the request, will need to check.
  
  const { jwt, name } = reqData;
  
  const seriesRequest = (jwt) => new Promise((resolve, reject) => {
    request.get(
      TVDB_API__SERIES_URL.replace(
        TVDB__TOKEN__SERIES_NAME,
        encodeURIComponent(name)
      ),
      { ...tvdbRequestProps({ jwt }) },
      tvdbResponseHandler(resolve, reject)
    );
  });
  
  if(jwt){
    return seriesRequest(jwt);
  }
  else{
    loadConfig(({ jwt }) => {
      seriesRequest(jwt)
        .then((series) => {
          jsonResp(res, series);
        })
        .catch(({ err, resp }) => {
          handleError({ res }, resp.statusCode, err);
        });
    });
  }
};

export const getSeriesEpisodes = ({ reqData, res }) => {
  // TODO - This returns all episodes for every season, so cache the episode
  // numbers along with their titles.
  // `airedSeason`, `airedEpisodeNumber`, `episodeName`
  
  const { jwt, seriesID } = reqData;
  
  const episodesRequest = (jwt) => new Promise((resolve, reject) => {
    request.get(
      TVDB_API__EPISODES_URL.replace(TVDB__TOKEN__SERIES_ID, seriesID),
      { ...tvdbRequestProps({ jwt }) },
      tvdbResponseHandler(resolve, reject)
    );
  });
  
  if(jwt){
    return episodesRequest(jwt);
  }
  else{
    loadConfig(({ jwt }) => {
      episodesRequest(jwt)
        .then((episodes) => {
          jsonResp(res, episodes);
        })
        .catch(({ err, resp }) => {
          handleError({ res }, resp.statusCode, err);
        });
    });
  }
};

export const previewRename = ({ reqData, res }) => {
  const names = reqData.names;
  
  // remove duplicates for the series request
  const uniqueNames = [];
  for(let i=0; i<names.length; i++){
    const name = names[i] && names[i].name;
    if(name && !uniqueNames.includes(name)) uniqueNames.push(name);
  }
  
  // TODO - If series' and eps are already in DB, don't bother loading
  // config, jump right to renaming.
  // TODO - Maybe just have a .db folder with individual series .json files.
  // Should prevent file bloat over time, and speed up read/write times.
  
  loadConfig(({ jwt }) => {
    const seriesName = uniqueNames[1]; // TODO - use item from loop
    let opts = { reqData: { jwt, name: seriesName } };
    
    // TODO - build out cache, skip anything that already exists in the DB
    // TODO - create loadDB func like loadConfig. It will have to be able to
    // handle loading multiple series files at once.
    
    getSeriesId(opts)
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
          opts = { reqData: { jwt, seriesID } };
          
          const db = {
            [seriesName]: {
              id: seriesID,
              season: {},
            },
          };
          
          getSeriesEpisodes(opts)
            .then((episodes) => {
              const currSeries = db[seriesName];
              
              for(let i=0; i<episodes.length; i++){
                const {
                  airedSeason,
                  airedEpisodeNumber,
                  episodeName,
                } = episodes[i];
                
                if(!currSeries.season[airedSeason])
                  currSeries.season[airedSeason] = { episodes: [] };
                
                const currSeasonEps = currSeries.season[airedSeason].episodes;
                currSeasonEps[airedEpisodeNumber] = episodeName;
              }
              
              console.log(JSON.stringify(db, null, 2));
              res.end();
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
  });
};