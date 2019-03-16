# ---- Base Node ----
FROM node:10-alpine AS base
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node

# ---- Dependencies ----
FROM base AS dependencies  
WORKDIR /home/node/app
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY --chown=node:node package*.json ./
# Switch the user to ensure that all of the application files are owned by the
# non-root `node` user, including the contents of the node_modules directory.
USER node
# install app dependencies including 'devDependencies'
RUN npm install

# ---- Copy Files/Build ----
FROM dependencies AS build  
WORKDIR /home/node/app
USER node
# copy over any files or folders required to build
COPY bin /home/node/app/bin
COPY src /home/node/app/src
COPY babel.config.js /home/node/app
COPY conf.app.js /home/node/app
COPY webpack.config.js /home/node/app
# compile the app
RUN npm run build:appForDocker

# --- Release with Alpine ----
FROM node:10-alpine AS release  
WORKDIR /home/node/app
#USER node
# Copy over prod deps
COPY --from=dependencies /home/node/app/package.json .
# Install app dependencies
RUN npm install --only=production
# Copy contents of the `build` step's `dist` to the current `app`
COPY --chown=node:node --from=build /home/node/app/dist .
# List off contents of final image
RUN ls -la /home/node/app
# Expose the default port from the server, on the container
EXPOSE 3001
# Start the app
CMD ["node", "cjs/server"]