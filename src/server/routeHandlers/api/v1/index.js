import { readFile, writeFile } from 'fs';
import { CONFIG_PATH } from 'ROOT/conf.repo';

export const checkForConfig = ({ res }) => {
  readFile(CONFIG_PATH, 'utf8', (err, config) => {
    const data = (err) ? {} : JSON.parse(config);
    
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
  });
};

export const updateConfig = ({ data, res }) => {
  readFile(CONFIG_PATH, (err, config) => {
    const _config = (err) ? {} : JSON.parse(config);
    
    Object.keys(data).forEach((key) => {
      const val = data[key];
      // delete blank values if they previously existed
      if(!val && _config[key]) delete _config[key];
      // or update/add the new value
      else _config[key] = val;
    });
    
    writeFile(CONFIG_PATH, JSON.stringify(_config, null, 2), 'utf8', (err) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(_config));
    });
  });
};

export const getJWT = (res) => {
  // TODO - Use credentials to get JWT `token`
  // Store in credentials with a timestamp. If the token is
  // older than 24 hours, get a new one.
  res.end();
};

export const getSeriesId = (res) => {
  // TODO - Get series `id`
  // - Store name and id in DB to make future lookups faster
  // - Returns an Array, so if there's more than one result, prompt the user
  // to choose.
  res.end();
};

export const getSeriesEpisodes = (res) => {
  // TODO - This returns all episodes for every season, so cache the episode
  // numbers along with their titles.
  // `airedSeason`, `airedEpisodeNumber`, `episodeName`
  res.end();
};