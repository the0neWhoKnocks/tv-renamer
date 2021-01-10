import { promises as fs } from 'fs';
import { parse, sep } from 'path';
import rimraf from 'rimraf';
import handleError from 'SERVER/routeHandlers/error';
import getFiles from 'SERVER/utils/getFiles';
import jsonResp from 'SERVER/utils/jsonResp';
import logger from 'SERVER/utils/logger';
import filesFilter from './utils/filesFilter';
import loadConfig from './utils/loadConfig';

const { stat, unlink } = fs;
const log = logger('server:deleteFile');

export default async function deleteFile({ reqData, res }) {
  const { data: { sourceFolder } } = await loadConfig();
  const file = reqData.file;
  const filePath = `${ sourceFolder }${ sep }${ file }`;
  let message = `Deleted file '${ file }'`;
  
  try { await stat(filePath); }
  catch(err) {
    return handleError({ res }, 500, `Couldn't find "${ filePath }" | ${ err.stack }`);
  }
  
  const allDone = () => {
    log(message);
    jsonResp(res, { message, file: filePath });
  };
  
  const _deleteFile = async (filePath) => {
    try {
      await unlink(filePath);
      allDone();
    }
    catch(err) {
      handleError({ res }, 500, `Couldn't delete file '${ err }'`);
    }
  };
  
  // delete folder and any child items
  if(file.includes(sep)){
    const rootDirInSource = parse(filePath.replace(sourceFolder, '')).dir.split(sep)[1];
    const rootDir = `${ sourceFolder }/${ rootDirInSource }`;
    
    try {
      const files = await getFiles(rootDir, filesFilter);
      
      // only delete folder if there aren't other files that can be renamed
      if(files.length === 1){
        // kill folder and contents
        rimraf(rootDir, { glob: false }, () => {
          message += ' and parent folder';
          allDone();
        });
      }
      else{
        // just delete file
        message += ' but not parent folder due to remaining files.';
        _deleteFile(filePath);
      }
    }
    catch(err) {
      handleError({ res }, 500, `Couldn't delete file "${ file }" | "${ err.stack }"`);
    }
  }
  // delete non-nested file
  else _deleteFile(filePath);
}
