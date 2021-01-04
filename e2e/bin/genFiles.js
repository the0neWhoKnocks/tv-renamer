const {
  copyFileSync,
  existsSync,
  lstatSync,
  readFile,
} = require('fs');
const { parse, resolve } = require('path');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

const DIST_PATH = (process.env.DIST_FILES_PATH) ? process.env.DIST_FILES_PATH : '../../dist';
const cmd = require(`${ DIST_PATH }/cjs/server/utils/cmd`).default;

const MOCK_FILES = (process.env.MOCK_FILES_PATH)
  ? process.env.MOCK_FILES_PATH
  : `${ resolve(__dirname, '../') }/mnt/mockFiles`;
const OUTPUT = `${ MOCK_FILES }/output`;
const SRC = `${ MOCK_FILES }/src`;

if( existsSync(MOCK_FILES) ) {
  // clean existing files (in the case where the directory already existed)
  rimraf.sync(`${ MOCK_FILES }/output/*`);
  rimraf.sync(`${ MOCK_FILES }/src/*`);
  console.log(`\nRemoved pre-existing items in "${ MOCK_FILES }"`);
}

// create directories
mkdirp.sync(OUTPUT);
console.log(`Created output directory ➜ "${ OUTPUT }"`);
mkdirp.sync(SRC);
console.log(`Created source directory ➜ "${ SRC }"`);

const args = process.argv.slice(2, process.argv.length);

// create test files
readFile(resolve(__dirname, './files.txt'), 'utf8', async (err, content) => {
  if(err) throw err;
  
  const MOCK_VID = `${ MOCK_FILES }/mock.mp4`;
  const lines = content.split('\n').filter(l => !!l);
  let mockFileExists = false;
  
  for(let i=0; i<lines.length; i++) {
    const fileName = lines[i];
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
      
      if(!mockFileExists){
        try {
          lstatSync(MOCK_VID);
          mockFileExists = true;
        }
        catch(err) {
          const video = {
            bitDepth: 'yuv420p',
            encoder: 'x264',
            length: '00:01:00', // 1 minute
            size: '720x480',
          };
          const audio = {
            channels: '2',
            encoder: 'aac',
          };
          
          console.log('Generating mock file (could take a few seconds)');
          await cmd([
            'ffmpeg',
            `-f lavfi -i color=c=black:s=${ video.size }`,
            '-f lavfi -i anullsrc=sample_rate=44100',
            '-crf 27 -preset veryfast',
            `-c:v:0 lib${ video.encoder } -pix_fmt ${ video.bitDepth } -map 0:v:0`,
            `-c:a:0 ${ audio.encoder } -ac:a:0 ${ audio.channels } -map 1:a:0`,
            `-t ${ video.length } "${ MOCK_VID }"`,
          ].join(' '));
        }
      }
      
      filePath += `/${ file.base }`;
      copyFileSync(MOCK_VID, filePath, (err) => {
        if(err) throw err;
        console.log(`Created file ➜ "${ filePath }"`);
      });
    }
  }
});
