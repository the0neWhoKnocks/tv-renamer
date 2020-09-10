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

const MOCK_FILES = `${ resolve(__dirname, '../') }/mnt/mockFiles`;
const OUTPUT = `${ MOCK_FILES }/output`;
const SRC = `${ MOCK_FILES }/src`;

if( existsSync(MOCK_FILES) ) {
  // clean existing files (in the case where the directory already existed)
  rimraf.sync(`${ MOCK_FILES }/*`);
  console.log(`\nRemoved pre-existing items in "${ MOCK_FILES }"`);
}

// create directories
mkdirp.sync(OUTPUT);
console.log(`Created output directory ➜ "${ OUTPUT }"`);
mkdirp.sync(SRC);
console.log(`Created source directory ➜ "${ SRC }"`);

const args = process.argv.slice(2, process.argv.length);

// create test files
readline.createInterface({
  input: createReadStream(resolve(__dirname, './files.txt')),
  terminal: false,
}).on('line', (fileName) => {
  const file = parse(fileName);
  let filePath = SRC;
  let generate = true;
  
  if(args && args.length){
    generate = false;
    
    for(let i=0; i<args.length; i++){
      if(fileName.toLowerCase().includes(args[i].toLowerCase())){
        generate = true;
        break;
      }
    }
  }
  
  if(generate){
    if(file.dir){
      const folder = `${ SRC }/${ file.dir }`;
      mkdirp.sync(folder);
      console.log(`Created file directory ➜ "${ folder }"`);
    
      filePath = folder;
    }
    
    filePath += `/${ file.base }`;
    closeSync(openSync(filePath, 'w'));
    console.log(`Created file ➜ "${ filePath }"`);
  }
});