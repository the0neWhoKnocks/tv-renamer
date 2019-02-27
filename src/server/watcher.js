import http from 'http';
import { create } from 'browser-sync';
import nodemon from 'nodemon';
import {
  DIST,
  DIST_JS,
  DIST_SERVER,
} from 'ROOT/conf.app';

const browserSync = create();
const port = +process.env.PORT || 8080;
const LOGGER_PREFIX = '[WATCHER]';

const checkServer = () => new Promise((rootResolve, rootReject) => {
  let count = 0;
  const check = () => new Promise((resolve, reject) => {
    setTimeout(() => {
      const serverAddress = `http://localhost:${ port }`;
      
      console.log(`${ LOGGER_PREFIX } Pinging ${ serverAddress }`);
      http.get(serverAddress, (res) => resolve())
        .on('error', (err) => reject());
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
  delay: 500,
  script: `${ DIST_SERVER }/index.js`,
  watch: [
    // WP bundled new code
    `${ DIST_JS }/manifest.json`,
    // The server has updated
    `${ DIST }/cjs/template.js`,
    `${ DIST_SERVER }/**/*.js`,
  ],
})
  .on('restart', () => {
    console.log(`${ LOGGER_PREFIX } Server restarting because file(s) changed`);
    
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