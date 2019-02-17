const { resolve } = require('path');

const SRC = resolve(__dirname, './src');

module.exports = {
  APP_NAME: 'TV Renamer',
  aliases: {
    COMPONENTS: `${ SRC }/components`,
    UTILS: `${ SRC }/utils`,
  },
  paths: {
    OUTPUT: 'dist',
  },
};