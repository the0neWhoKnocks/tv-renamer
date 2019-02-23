import getFolders from './getFolders';
import readDir from './readDir';

const walk = (source) => new Promise((resolve, reject) => {
  readDir(source)
    .then((files) => getFolders(files))
    .then(({ files, folders }) => {
      if(folders.length){
        const pending = folders.map((folder) => walk(folder));
        
        return Promise.all(pending)
          .then((nestedFiles) => {
            const flattened = [];
            
            for(let i=0; i<nestedFiles.length; i++){
              for(let j=0; j<nestedFiles[i].length; j++){
                flattened.push(nestedFiles[i][j]);
              }
            }
            
            return resolve([
              ...flattened,
              ...files,
            ]);
          });
      }
      else{
        return resolve(files);
      }
    })
    .catch((err) => reject(err));
});

export default walk;