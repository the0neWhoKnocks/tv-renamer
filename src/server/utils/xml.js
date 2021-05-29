import { writeFile } from 'fs';
import { create as createXML } from 'xmlbuilder2';
import logger from './logger';

const log = logger('server:utils:xml');

function writeXML(data, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = createXML({
      version: '1.0',
      encoding: 'UTF-8',
      standalone: 'yes',
    }, data);
    const xml = doc.end({ prettyPrint: true });
    
    writeFile(outputPath, xml, 'utf8', (err) => {
      if (err) {
        log(`[ERROR] Writing path "${ outputPath }"\n${ err.stack }`);
        reject(err);
      }
      else {
        // log(`Wrote "${ outputPath }"\n${ xml }`);
        log(`Wrote "${ outputPath }"`);
        resolve();
      }
    });
  });
}

module.exports = { writeXML };
