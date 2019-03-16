# TV Renamer

A local network app that allows for renaming TV shows

---

## Install

```sh
yarn add @noxx/tv-renamer
# or
npm i @noxx/tv-renamer
```

---

## Usage

---

## Development

```sh
# Install all deps
yarn
# or
npm i

# Start dev server
yarn start:dev
# or
npm run start:dev
```

Utilizes these API's
- [GitHub](https://developer.github.com/v3/repos)
- [TVDB](https://api.thetvdb.com/swagger)

---

## Build & Run Docker Image

```sh
# Builds the image
docker build -t noxx/tv-renamer .

# Run the new image
# - The local port of 9000 will map to the containers exposed port 3001
# - Creating/using a volume of `renamer-data` which points to the
#   `/home/node/app/.data` folder on the container.
# - For testing purposes, using a bind-mount which is pointing to the current
#   repo's `.ignore/tmp` directory and mapping it to `/home/node/app/_temp_`.
#   The command is stripping `/mnt` from the beginning of the current directory
#   to account for Docker on Windows and WSL.
docker run -d --name tv-renamer \
  -p 9000:3001 \
  -v renamer-data:/home/node/app/.data \
  -v ${$(echo $PWD)#"/mnt"}/.ignore/tmp:/home/node/app/_temp_ \
  noxx/tv-renamer

# Verify the image is up and running. If it's not, you'll see "Exited" in the
# "Status" column.
docker ps -a

# Stop the image
docker stop tv-renamer
# Clean things up
docker rm tv-renamer
```

---

#### Troubleshooting

**App doesn't start on same port**
Sometimes a process hangs and a zombie `node` process is locking the expected
port, so just run `pkill -9 node` to kill all `node` processes.
