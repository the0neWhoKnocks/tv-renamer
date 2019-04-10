import { existsSync, unlink } from 'fs';
import { parse, sep } from 'path';
import rimraf from 'rimraf';
import handleError from 'SERVER/routeHandlers/error';
import getFiles from 'SERVER/utils/getFiles';
import jsonResp from 'SERVER/utils/jsonResp';
import filesFilter from './utils/filesFilter';
import loadConfig from './utils/loadConfig';

export default ({ reqData, res }) => {
  loadConfig(({ sourceFolder }) => {
    const file = reqData.file;
    const filePath = `${ sourceFolder }${ sep }${ file }`;
    
    if(existsSync(filePath)){
      let message = `Deleted file '${ file }'`;
      
      const allDone = () => {
        console.log(message);
        jsonResp(res, {
          message,
          file: filePath,
        });
      };
      
      const deleteFile = (filePath) => {
        unlink(filePath, (err) => {
          if(err) handleError({ res }, 500, `Couldn't delete file '${ err }'`);
          else{  
            allDone();
          }
        }); 
      };
      
      // delete file
      if(file.includes(sep)){
        const rootDir = parse(filePath).dir;
        // only delete folder if there aren't other files that can be renamed
        getFiles(rootDir, filesFilter)
          .then((files) => {
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
              deleteFile(filePath);
            }
          });
      }
      else{
        // just delete file
        deleteFile(filePath);
      }
    }
    else{
      handleError({ res }, 500, `Couldn't find '${ filePath }'`);
    }
  });
};