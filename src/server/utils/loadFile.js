import { promises as fs } from 'fs';
import logger from 'SERVER/utils/logger';

const { readFile } = fs;
const log = logger('server:loadFile');

export const ERROR_TYPE__LOAD_FAILURE = 'loadFailure';
export const ERROR_TYPE__PARSE_FAILURE = 'parseFailure';

const _default = {};

export default async function loadFile(file) {
  let data, error;
  
  try {
    log(`  [LOAD] "${ file }"`);
    
    const fileContents = await readFile(file, 'utf8');
    
    try { data = JSON.parse(fileContents); }
    catch (err) {
      log(`  [PARSE] failed, file contents are "${ fileContents }"`);
      data = _default;
      error = {
        type: ERROR_TYPE__PARSE_FAILURE,
        message: err.message,
      };
    }
  }
  catch (err) {
    log(`  [FAILED] to load file: "${ err.message }"`);
    data = _default;
    error = {
      type: ERROR_TYPE__LOAD_FAILURE,
      message: err.message,
    };
  }
  
  return { data, error };
}
