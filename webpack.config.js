const { resolve } = require('path');
const webpack = require('webpack');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const {
  PUBLIC,
  PUBLIC_JS,
  WP__ENTRY,
  WP__OUTPUT,
} = require('./conf.app');

const HASH_LENGTH = 5;
const mode = process.env.MODE;
const dev = mode === 'development';
const stats = {
  chunks: false,
  colors: true,
  errors: true,
  errorDetails: true,
  modules: false,
};

const conf = {
  entry: {
    app: WP__ENTRY,
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
  mode,
  module: {
    rules: [
      {
        use: 'babel-loader',
        exclude: /node_modules/,
        test: /\.js$/,
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          enforce: true,
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
        },
      },
    },
  },
  output: {
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info => resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    // assigns the hashed name to the file
    filename: `[name]_[chunkhash:${ HASH_LENGTH }].js`,
    path: WP__OUTPUT,
    publicPath: `${ PUBLIC_JS.replace(PUBLIC, '') }/`,
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        '**/*',
        '!manifest.json', // the watcher won't pick up on changes if this is deleted
        '!vendor',
        '!vendor/**/*',
      ],
    }),
    new webpack.DefinePlugin({
      'process.env.DATA_PATH': JSON.stringify(process.env.DATA_PATH),
    }),
    /**
     * Gives more control of how bundles are hashed
     */
    new webpack.HashedModuleIdsPlugin({
      hashDigestLength: HASH_LENGTH,
    }),
    /**
     * Generate a manifest file which contains a mapping of all asset filenames
     * to their corresponding output file so that tools can load them without
     * having to know the hashed name.
     */
    new ManifestPlugin({
      filter: ({ isChunk, isInitial }) => {
        return isChunk && isInitial;
      },
      writeToFileEmit: true,
    }),
    /**
     * Provides build progress in the CLI
     */
    new SimpleProgressWebpackPlugin({
      format: 'minimal',
    }),
  ],
  resolve: {
    extensions: ['.js'],
  },
  stats: stats,
};

// related to WSL2: https://github.com/microsoft/WSL/issues/4739
if (dev && !!process.env.WSL_INTEROP) {
  conf.watchOptions = {
    aggregateTimeout: 200,
    poll: 1000,
  };
}

module.exports = conf;
