import { PUBLIC_CONFIG } from 'ROOT/conf.app';
import loadConfig from './loadConfig';
import saveFile from './saveFile';

export default (data, res, cb) => {
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