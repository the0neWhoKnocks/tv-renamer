# # Setup the environment
# FROM node:10-alpine AS release
# ENV NODE_ENV=production
# ENV APP=/home/node/app
# RUN mkdir -p $APP/node_modules && chown -R node:node /home/node/*
# WORKDIR $APP
# # Copy over package related files to install production modules
# COPY --chown=node:node ./package*.json ./
# # Install production dependencies
# RUN npm i --only=production --quiet
# # Copy locally compiled code to the image
# COPY --chown=node:node ./dist ./
# # List off contents of final image
# RUN ls -la $APP
# # Expose the default port from the server, on the container
# EXPOSE 3001
# # Start the app
# CMD ["node", "cjs/server"]



## Base Node image with ffmpeg
FROM jrottenberg/ffmpeg:4.1-alpine as ffmpeg
FROM node:10-alpine as node-w-ffmpeg
# - For some reason `expat` & `libgomp` are installed in the original image, but
# after the copy occurs, they're missing. Installing them in the Node image
# gets rid of random errors.
# - `tzdata` so the `TZ` env var works for timezones
RUN apk add --no-cache --update expat libgomp tzdata
# copy over the ffmpeg binaries
COPY --from=ffmpeg /usr/local/ /usr/local/

# start building the base
FROM node-w-ffmpeg as tv-renamer--packagejson
# Create a temporary package.json where things like `version` and `scripts`
# are omitted so the cache of the build step won't be invalidated.
COPY --chown=node:node ./package*.json ./
RUN ["node", "-e", " \
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8')); \
  const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf-8')); \
  \
  let preInstallScript; \
  if (pkg.scripts && pkg.scripts.preinstall) preInstallScript = pkg.scripts.preinstall; \
  \
  delete pkg.devDependencies; \
  delete pkg.scripts; \
  delete pkg.version; \
  delete lock.version; \
  \
  if (preInstallScript) pkg.scripts = { preinstall: preInstallScript }; \
  \
  fs.writeFileSync('package.json', JSON.stringify(pkg)); \
  fs.writeFileSync('package-lock.json', JSON.stringify(lock)); \
"]

# Set up the environment
FROM node-w-ffmpeg AS movie-list
ENV NODE_ENV=production
ENV APP=/home/node/app
ENV IN_DOCKER=true
RUN mkdir -p $APP/node_modules && chown -R node:node /home/node/*

# Set up a usable terminal experience for development
COPY ./.docker/.zshrc /root/.zshrc
RUN apk add --no-cache --update zsh \
  && wget -O /root/zsh-autosuggestions.zsh https://raw.githubusercontent.com/zsh-users/zsh-autosuggestions/v0.6.4/zsh-autosuggestions.zsh \
  && touch /root/.zsh_history \
  && chmod +x /root/.zsh_history /root/.zshrc /root/zsh-autosuggestions.zsh

# - `rsync` for the `dist` setup
RUN apk add --no-cache --update rsync

WORKDIR $APP

# Copy over package related files from the preperation step to install
# production modules
COPY --chown=node:node --from=tv-renamer--packagejson ./package*.json ./

# Install production dependencies and compile assets
RUN npm i --only=production --quiet --unsafe-perm \
  && rm ./package*.json

# Copy locally compiled code to the image
COPY --chown=node:node ./dist ./

# Expose the default port from the Server, on the container
EXPOSE 3001

# Start the app
CMD ["node", "cjs/server"]
