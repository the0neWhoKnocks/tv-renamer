# TV Renamer

A local network app that allows for renaming TV shows

---

## Install

- [Install on FreeNAS with Portainer](docs/FreeNAS.md)

---

## Build & Run Docker Image

**NOTE** - I've created these shell aliases to speed up terminal workflow:
| Alias | Command          |
| ----- | ---------------- |
| `dc`  | `docker-compose` |
| `d`   | `docker`         |
| `nr`  | `npm run`        |

**Prerequisites**
- If running on Windows you may need to go into `Docker > Settings > Shared Drives` and enable the drive you want to use a bind-mount with.

In order to have a consistent Prod/Dev experience, the first build of the image
takes a few manual steps.
1. Create the base image (with no dist files copied over since they haven't been compiled yet).
   ```sh
   dc build tv-renamer
   ```
1. If you ran `dc up tvrenamer_prod` now you'd get an error because there's no
source files. So, let's create them.
   ```sh
   # first go into the Dev container
   dc up -d tvrenamer_dev & sleep 2 && d exec -it tvrenamer_dev zsh && dc down
   # install deps (installed from the image so that Linux modules are installed)
   npm i
   # compile the files
   nr build:appForDocker
   # generate some files to rename (only needs to be run in the container if the mock video file hasn't already been generated)
   nr gen:files "veep" "game.of.thrones"
   # leave the container
   exit
   # build again to copy over assets
   dc build tv-renamer
   ```
1. Now you can run the Prod image
   ```sh
   # start the App
   dc up tvrenamer_prod
   ```

---

## Development

This is an atypical setup. To allow for the same flexibility you'd normally have
while developing, but also ensuring things will work the same in Prod, some
commands have to be run within the Docker Container to ensure things work.
```sh
# Starts the Service in the background
dc up -d tvrenamer_dev

# Enter the running Container and run all other commands as usual.
# Notice the use of `dc down` after the first command. This ensures that a Dev
# doesn't accidentally keep the background Service running.
d exec -it tvrenamer_dev zsh && dc down

# Or a one liner. Note that if the Container wasn't previously built, the
# command will fail because the Container won't be available within 2 seconds.
dc up -d tvrenamer_dev & sleep 2 && d exec -it tvrenamer_dev zsh && dc down
```

To run scripts in another Shell while the Dev shell is running
```sh
dc exec tvrenamer_dev zsh
```

Once you're within the Docker Container, you can run all commands as normal.
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
targets**, and make sure that there's an entry for:
```sh
localhost:9229
```
Simply put, there has to be an entry listening to the WebSocket port listed by
the servers output `9229` (the inspector port), and `9000` (the server's port).

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

---

## Misc.

Utilizes these API's
- [GitHub](https://developer.github.com/v3/repos)
- [theMovieDB](https://developers.themoviedb.org/3/getting-started/introduction)
- [fanart.tv](https://fanarttv.docs.apiary.io/#reference/tv/get-show/get-images-for-show)
   - https://fanart.tv/tutorials/how-fanart-tv-works/
