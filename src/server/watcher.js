import http from 'http';
import { parse } from 'path';
import { create } from 'browser-sync';
import nodemon from 'nodemon';
import {
  DIST,
  DIST_JS,
  DIST_SERVER,
} from 'ROOT/conf.repo';

const browserSync = create();
const port = +process.env.PORT || 8080;

const checkServer = () => new Promise((rootResolve, rootReject) => {
  let count = 0;
  const check = () => new Promise((resolve, reject) => {
    setTimeout(() => {
      http.get(
        `http://localhost:${ port }`,
        (res) => resolve()
      ).on('error', (err) => reject());
    }, 1000);
  });
  const handleError = () => {
    if(count < 3){
      ping();
      count++;
    }
    else{
      rootReject();
    }
  };
  const handleSuccess = () => { rootResolve(); };
  const ping = () => {
    check()
      .then(handleSuccess)
      .catch(handleError);
  };
  
  ping();
});

nodemon({
  script: `./${ DIST_SERVER }/index.js`,
  watch: [
    // WP bundled new code
    `./${ DIST_JS }/manifest.json`,
    // The server has updated
    `./${ DIST }/cjs/template.js`,
    `./${ DIST_SERVER }/**/*.js`,
  ],
})
  .on('restart', (files) => {
    const msg = (files.length > 1) ? 'these files' : 'this file';
    console.log(
      `Nodemon restarted because ${ msg } changed:\n`,
      files.map((filePath) => ` • "${ parse(filePath).base }"`).join('\n')
    );
    
    checkServer()
      .then(() => {
        console.log('Server has fully started');
        browserSync.reload();
      })
      .catch(() => {
        console.log("Couldn't detect the server, a manual reload may be required");
      });
  });

// https://www.browsersync.io/docs/options
browserSync.init({
  ghostMode: false, // don't mirror interactions in other browsers
  // logLevel: 'debug',
  open: false,
  port: port + 1,
  proxy: `localhost:${ port }`,
  snippetOptions: {
    rule: {
      match: /<\/body>/i,
      fn: (snippet) => snippet,
    },
  },
  ui: {
    port: port + 2,
  },
});