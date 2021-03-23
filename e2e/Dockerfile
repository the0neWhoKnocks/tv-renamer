# source Dockerfile https://github.com/cypress-io/cypress-docker-images/blob/master/included/5.1.0/Dockerfile
FROM cypress/included:6.3.0 AS cypress

RUN \
  npm i -g \
  # for `genFiles`
  mkdirp rimraf \
  # for tests
  xmlbuilder2 \
  # # for tests
  # cypress-log-to-output \
  # fbjs react@16.3.2 react-dom@16.3.2 object-assign prop-types \
  # create symlink so global modules can be found
  && ln -s /usr/local/lib/node_modules /node_modules
ENV NODE_PATH /usr/local/lib/node_modules

WORKDIR /e2e
