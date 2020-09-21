import { readFile } from 'fs';
import {
  APP_NAME,
  PUBLIC,
  PUBLIC_MANIFEST,
  PUBLIC_VENDOR,
} from 'ROOT/conf.app';
import template from 'SRC/template';
import handleError from './error';

const prodMode = process.env.MODE === 'production';
const relativeVendor = PUBLIC_VENDOR.replace(PUBLIC, '');

export default ({ res }) => {
  readFile(PUBLIC_MANIFEST, 'utf8', (err, manifest) => {
    let bundleScripts;
    
    if(err || !manifest){
      return handleError({ res }, 404, err || `Manifest contents are: "${ manifest }"`);
    }
    else{
      bundleScripts = JSON.parse(manifest);
    }
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(template({
      bundleScripts: Object.keys(bundleScripts).map(
        (key) => bundleScripts[key]
      ),
      // rootContent: '', // uncomment if content needs to be rendered on server
      scripts: {
        head: [
          `${ relativeVendor }/react.${ (prodMode) ? 'production.min' : 'development' }.js`,
          `${ relativeVendor }/react-dom.${ (prodMode) ? 'production.min' : 'development' }.js`,
        ],
      },
      title: APP_NAME,
    }));
  });
};