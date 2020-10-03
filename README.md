# TV Renamer

A local network app that allows for renaming TV shows

---

## Install

- [Install on FreeNAS with Portainer](docs/FreeNAS.md)

---

## Development

```sh
# Install all deps
npm i

# Start dev server
npm run start:dev
```

Debugging the server:
- When `start:dev` is used, you'll see a message like
```sh
Debugger listening on ws://127.0.0.1:9229<HASH>
```
in the terminal. By default, you should be able to go to chrome://inspect/#devices
in Chrome, and see a **Remote Target** connected. I had an issue where my
**network targets** got misconfigured. If you're not seeing a Remote Target
connected, you'll want to click on **Configure** next to **Discover network
targets**, and make sure that there are entries for:
```sh
localhost:9229
localhost:9000
```
Simply put, there has to be an entry listening to the WebSocket port listed by
the servers output `9229` (the inspector port), and `9000` (the server's port).

Utilizes these API's
- [GitHub](https://developer.github.com/v3/repos)
- [TMDB](https://developers.themoviedb.org/3/getting-started/introduction)

---

## Build & Run Docker Image

**Prerequisites**
- If running on Windows you may need to go into `Docker > Settings > Shared Drives`
  and enable the drive you want to use a bind-mount with.

```sh
# Run the below only if you haven't been developing in the repo. Otherwise you 
# should already have the necessary modules installed.
npm i
# Compiles the production ready code
npm run build:appForDocker
# Generates test folders/files to validate against. Folder will be mapped via
# a `volume` during `docker-compose`.
npm run gen:files
# Generate specific files
npm run gen:files "<TEXT_FROM_FILE_NAME>" "<TEXT_FROM_ANOTHER_FILE_NAME>"

# Builds the image
docker-compose build tv-renamer

# Run the new image
docker-compose up -d tv-renamer

# Verify the image is up and running. If it's not, you'll see "Exited" in the
# "Status" column.
docker ps -a

# Stops the image and cleans things up
docker-compose down
```

---

## Testing

In order to ensure Cypress runs consistently on all OS's for CI and the GUI mode
I've opted for the Docker image. One downside to this is the size (over 2gb,
yeesh). I tried the non-Docker route, and the setup would be different for all
OS's and there was no guarantee it'd even work.

If you don't care about the GUI mode, just run `npm run test`.

To get the GUI to work, follow the instructions for your OS.

**Windows/WSL**
- Install `choco install vcxsrv`

**OSX**
- Install `brew install xquartz`
- Start XQuartz `open -a xquartz`.
   - Go to Preferences > Security.
      - Make sure `Allow connections from network clients` is checked
- Once the settings have been updated you can close XQuartz

**Once an XServer is set up on your OS**, run:
```sh
npm run e2e:watch
# if you already have the Containers and App built
npm run e2e:watch -- --skip-build
```

---

## Releasing

You can simply run `./bin/release.sh` and follow the steps. Or go through
everything manually below. To skip having to enter a Docker password every time,
create a `.dockercreds` file at the root of the repo and put your password in
there.

If something happens during the final stage of the release, you'll have to
manually reset some things.
```sh
# Reset the last commit
git reset --soft HEAD~1
# Verify that just release files will be reset. You should just see:
# - `CHANGELOG.md`
# - `package-lock.json`
# - `package.json`
git status
# If the above is good, unstage those changes
git reset
# Reset changed files
git checkout -- CHANGELOG.md package.json package-lock.json
# Check if a git tag was created
git tag | cat
# If so, remove it
git tag -d <TAG_NAME>
```
