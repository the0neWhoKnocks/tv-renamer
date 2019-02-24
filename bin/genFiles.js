const {
  closeSync,
  createReadStream,
  existsSync,
  openSync,
} = require('fs');
const { parse, resolve } = require('path');
const readline = require('readline');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const {
  TMP,
  TMP_OUTPUT,
  TMP_SRC,
} = require('../conf.app');

if( existsSync(TMP) ) {
  // clean existing files (in the case when the directory already existed)
  rimraf.sync(`${ TMP }/*`);
  console.log(`\nRemoved pre-existing items in "${ TMP }"`);
}

// create directories
mkdirp.sync(TMP_OUTPUT);
console.log(`Created output directory ➜ "${ TMP_OUTPUT }"`);
mkdirp.sync(TMP_SRC);
console.log(`Created source directory ➜ "${ TMP_SRC }"`);

// create test files
readline.createInterface({
  input: createReadStream(resolve(__dirname, './files.txt')),
  terminal: false,
}).on('line', (fileName) => {
  const file = parse(fileName);
  let filePath = TMP_SRC;
  
  if(file.dir){
    const folder = `${ TMP_SRC }/${ file.dir }`;
    mkdirp.sync(folder);
    console.log(`Created file directory ➜ "${ folder }"`);
    
    filePath = folder;
  }
  
  filePath += `/${ file.base }`;
  closeSync(openSync(filePath, 'w'));
  console.log(`Created file ➜ "${ filePath }"`);
});