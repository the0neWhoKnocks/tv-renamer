# source Dockerfile https://github.com/cypress-io/cypress-docker-images/blob/master/included/5.1.0/Dockerfile
FROM cypress/included:5.2.0 AS cypress

# Adding modules for `genFiles`
RUN npm i -g mkdirp rimraf
ENV NODE_PATH /usr/local/lib/node_modules

WORKDIR /e2e
