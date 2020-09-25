import { readFile } from 'fs';
import logger from 'SERVER/utils/logger';

const log = logger('server:loadFile');

export const ERROR_TYPE__LOAD_FAILURE = 'loadFailure';
export const ERROR_TYPE__PARSE_FAILURE = 'parseFailure';

export default ({ _default = {}, cb, file }) => {
  log(`  [LOAD] "${ file }"`);
  
  readFile(file, 'utf8', (err, fileContents) => {
    if(err) log(`  [FAILED] to load file: "${ err.message }"`);
    
    let data, error;
    
    if(err){
      data = _default;
      error = {
        type: ERROR_TYPE__LOAD_FAILURE,
        message: err.message,
      };
    }
    else{
      try {
        data = JSON.parse(fileContents);
      }
      catch(err){
        log(`  [PARSE] failed, file contents are "${ fileContents }"`);
        data = _default;
        error = {
          type: ERROR_TYPE__PARSE_FAILURE,
          message: err.message,
        };
      }
    }
    
    cb(data, error);
  });
};