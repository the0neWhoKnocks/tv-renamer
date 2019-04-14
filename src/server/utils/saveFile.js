import { writeFile, writeFileSync } from 'fs';
import handleError from 'SERVER/routeHandlers/error';

export default ({ cb, data, file, res, sync }) => {
  const handleResult = (err) => {
    if(err && res) handleError({ res }, 500, err);
    else{
      const args = [data];
      if(err) args.push(err);
      cb(...args);
    }
  };
  
  if(sync){
    try {
      writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
      handleResult();
    }
    catch(err){
      handleResult(err);
    }
  }
  else{
    writeFile(file, JSON.stringify(data, null, 2), 'utf8', (err) => {
      handleResult(err);
    });
  }
};