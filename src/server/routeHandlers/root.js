import { readFileSync } from 'fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { renderStylesToString } from 'emotion-server';
import { cache } from 'emotion';
import { CacheProvider } from '@emotion/core';
import App from 'COMPONENTS/App';
import {
  APP_NAME,
  DIST_JS,
  DIST_VENDOR,
  PUBLIC,
  SYSTEM_DIST_JS,
} from 'ROOT/conf.repo';
import template from 'SRC/template';

const prodMode = process.env.MODE === 'production';
const relativeJS = DIST_JS.replace(PUBLIC, '');
const relativeVendor = DIST_VENDOR.replace(PUBLIC, '');

export default (res) => {
  const bundleScripts = JSON.parse(readFileSync(
    `${ SYSTEM_DIST_JS }/manifest.json`,
    'utf8'
  ));
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(template({
    bundleScripts: Object.keys(bundleScripts).map(
      (key) => `${ relativeJS }/${ bundleScripts[key] }`
    ),
    rootContent: renderStylesToString(
      renderToString(
        <CacheProvider value={cache}>
          <App />
        </CacheProvider>
      )
    ),
    scripts: {
      head: [
        `${ relativeVendor }/react.${ (prodMode) ? 'production.min' : 'development' }.js`,
        `${ relativeVendor }/react-dom.${ (prodMode) ? 'production.min' : 'development' }.js`,
      ],
    },
    title: APP_NAME,
  }));
};