import React from 'react';
import { renderToString } from 'react-dom/server';
import { renderStylesToString } from 'emotion-server';
import { cache } from 'emotion';
import { CacheProvider } from '@emotion/core';
import App from 'COMPONENTS/App';
import {
  APP_NAME,
  PUBLIC,
  PUBLIC_JS,
  PUBLIC_VENDOR,
} from 'ROOT/conf.app';
import template from 'SRC/template';

const prodMode = process.env.MODE === 'production';
const relativeJS = PUBLIC_JS.replace(PUBLIC, '');
const relativeVendor = PUBLIC_VENDOR.replace(PUBLIC, '');

export default ({ res }) => {
  const bundleScripts = require('PUBLIC_MANIFEST');
  
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